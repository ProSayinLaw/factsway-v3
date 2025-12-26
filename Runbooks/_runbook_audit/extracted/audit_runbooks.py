import json
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple


# Paths
SCRIPT_PATH = Path(__file__).resolve()
OUTPUT_ROOT = SCRIPT_PATH.parents[1]
RUNBOOK_ROOT = OUTPUT_ROOT.parent


# Patterns
RUNBOOK_PATTERNS = [
    "*RUNBOOK*.md",
    "RUNBOOK_*.md",
    "00_RUNBOOK_0_*.md",
]

ADDITIONAL_PATTERNS = [
    "BACKEND_AUDIT_PART_*.md",
    "01_COMPLETE_ARCHITECTURE_MAP.md",
    "02_IMPLEMENTATION_GUIDE.md",
    "README.md",
    "JOURNAL.md",
]

REST_PATTERN = re.compile(r"\b(GET|POST|PUT|PATCH|DELETE)\s+(/[A-Za-z0-9_\-\/:{}]+)")
IPC_PATTERN = re.compile(r"\b(IPC|channel|port|invoke|handle)\b", re.IGNORECASE)
SCHEMA_PATTERN = re.compile(r"\b(LegalDocument|Schema|JSON Schema|Zod)\b", re.IGNORECASE)
SCHEMA_INTERFACE_PATTERN = re.compile(r"\b(interface|type)\s+([A-Za-z0-9_]+)")
VERIFICATION_PATTERN = re.compile(
    r"\b(Verify|Run:|Command:|drift-detector|npm test|pnpm test|pytest)\b",
    re.IGNORECASE,
)
RISK_PATTERN = re.compile(r"\b(HIGH RISK|risk|blocker|failure mode|sharp edge)\b", re.IGNORECASE)
INVARIANT_PATTERN = re.compile(r"\binvariant\b", re.IGNORECASE)
FILE_PATTERN = re.compile(r"\b[\w\.-]+\.(pdf|docx|json|txt|csv|yaml|yml|md)\b", re.IGNORECASE)


COLOR_ORDER = ["RED", "YELLOW", "GREEN"]


@dataclass
class DetectedEntry:
    kind: str
    name: str
    details: Dict[str, str]
    source: str
    snippet: str
    file: str
    line_start: int
    line_end: int


@dataclass
class FileData:
    path: Path
    rel_path: str
    is_runbook: bool
    runbook_number: Optional[int]
    lines: List[str]
    rest: List[DetectedEntry] = field(default_factory=list)
    ipc: List[DetectedEntry] = field(default_factory=list)
    schemas: List[DetectedEntry] = field(default_factory=list)
    verifications: List[DetectedEntry] = field(default_factory=list)
    risks: List[DetectedEntry] = field(default_factory=list)
    invariants: List[DetectedEntry] = field(default_factory=list)
    files: List[DetectedEntry] = field(default_factory=list)
    headings: List[Tuple[int, int, str]] = field(default_factory=list)  # (line, level, title)


def make_snippet(text: str, word_limit: int = 25) -> str:
    words = text.strip().split()
    if len(words) <= word_limit:
        return " ".join(words)
    return " ".join(words[:word_limit]) + "..."


def ensure_dirs() -> None:
    dirs = [
        OUTPUT_ROOT / "registries",
        OUTPUT_ROOT / "reports",
        OUTPUT_ROOT / "runbook_cards",
        OUTPUT_ROOT / "extracted",
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)


def matches_pattern(name: str, patterns: List[str]) -> bool:
    from fnmatch import fnmatch

    return any(fnmatch(name, pat) for pat in patterns)


def extract_runbook_number(name: str) -> Optional[int]:
    m = re.search(r"RUNBOOK[_\s\-]*0*?(\d+)", name, re.IGNORECASE)
    if m:
        try:
            return int(m.group(1))
        except ValueError:
            return None
    return None


def discover_files() -> List[FileData]:
    discovered: List[FileData] = []
    for root, dirs, files in os.walk(RUNBOOK_ROOT):
        # Skip output directory
        if "_runbook_audit" in root.split(os.sep):
            continue
        for filename in files:
            if not filename.lower().endswith(".md"):
                continue
            rel_path = os.path.relpath(os.path.join(root, filename), RUNBOOK_ROOT)
            is_runbook = matches_pattern(filename, RUNBOOK_PATTERNS)
            include_additional = matches_pattern(filename, ADDITIONAL_PATTERNS)
            if not is_runbook and not include_additional:
                continue
            runbook_number = extract_runbook_number(filename) if is_runbook else None
            file_path = RUNBOOK_ROOT / rel_path
            lines = file_path.read_text(encoding="utf-8").splitlines()
            headings = []
            for idx, line in enumerate(lines, 1):
                m = re.match(r"^(#+)\s+(.*)", line)
                if m:
                    headings.append((idx, len(m.group(1)), m.group(2).strip()))
            discovered.append(
                FileData(
                    path=file_path,
                    rel_path=rel_path,
                    is_runbook=is_runbook,
                    runbook_number=runbook_number,
                    lines=lines,
                    headings=headings,
                )
            )
    # Sort runbooks numerically, others after
    discovered.sort(key=lambda fd: (0 if fd.is_runbook else 1, fd.runbook_number or 999, fd.rel_path))
    return discovered


def add_entry(entries: List[DetectedEntry], kind: str, name: str, details: Dict[str, str], rel_path: str, line_no: int, line_end: Optional[int], snippet_text: str) -> None:
    entry = DetectedEntry(
        kind=kind,
        name=name.strip(),
        details=details,
        source=f"{rel_path}:L{line_no}-L{line_end or line_no}",
        snippet=make_snippet(snippet_text),
        file=rel_path,
        line_start=line_no,
        line_end=line_end or line_no,
    )
    entries.append(entry)


def scan_file(fd: FileData) -> None:
    for idx, line in enumerate(fd.lines, 1):
        rest_match = REST_PATTERN.search(line)
        if rest_match:
            method, path = rest_match.groups()
            add_entry(fd.rest, "REST", f"{method} {path}", {}, fd.rel_path, idx, None, line)
        if IPC_PATTERN.search(line):
            add_entry(fd.ipc, "IPC", line.strip(), {}, fd.rel_path, idx, None, line)
        schema_match = SCHEMA_PATTERN.search(line)
        if schema_match:
            add_entry(fd.schemas, "Schema", schema_match.group(0), {}, fd.rel_path, idx, None, line)
        schema_iface = SCHEMA_INTERFACE_PATTERN.search(line)
        if schema_iface:
            add_entry(fd.schemas, "Schema", f"{schema_iface.group(1)} {schema_iface.group(2)}", {}, fd.rel_path, idx, None, line)
        if VERIFICATION_PATTERN.search(line):
            add_entry(fd.verifications, "Verification", line.strip(), {}, fd.rel_path, idx, None, line)
        if RISK_PATTERN.search(line):
            add_entry(fd.risks, "Risk", line.strip(), {}, fd.rel_path, idx, None, line)
        if INVARIANT_PATTERN.search(line):
            add_entry(fd.invariants, "Invariant", line.strip(), {}, fd.rel_path, idx, None, line)
        file_match = FILE_PATTERN.search(line)
        if file_match:
            add_entry(fd.files, "File", file_match.group(0), {}, fd.rel_path, idx, None, line)


def get_section(fd: FileData, keywords: List[str]) -> Tuple[Optional[str], Optional[int], Optional[int]]:
    for i, (line_no, level, title) in enumerate(fd.headings):
        if any(k.lower() in title.lower() for k in keywords):
            start = line_no + 1
            end = fd.headings[i + 1][0] - 1 if i + 1 < len(fd.headings) else len(fd.lines)
            section_text = "\n".join(fd.lines[start - 1 : end]).strip()
            return section_text if section_text else None, start, end
    return None, None, None


def record_todo(todos: List[str], message: str, source: str) -> None:
    todos.append(f"{message} ({source})")


def build_runbook_card(fd: FileData, todos: List[str]) -> str:
    total_lines = len(fd.lines) or 1
    def ensure_content(text: Optional[str], label: str, start: Optional[int], end: Optional[int]) -> Tuple[str, bool]:
        if text:
            return text, True
        src = f"{fd.rel_path}:L1-L{total_lines}"
        record_todo(todos, f"{label} missing", src)
        return "UNSPECIFIED\nTODO: Provide details ({})".format(src), False

    purpose_text, ps, pe = get_section(fd, ["purpose"])
    purpose_value, has_purpose = ensure_content(purpose_text, "Purpose", ps, pe)

    produces_text, prs, pre = get_section(fd, ["produce", "artifact", "output"])
    produces_value, has_produces = ensure_content(produces_text, "Produces (Artifacts)", prs, pre)

    consumes_text, cs, ce = get_section(fd, ["consume", "prereq", "input"])
    consumes_value, has_consumes = ensure_content(consumes_text, "Consumes (Prereqs)", cs, ce)

    card_lines: List[str] = []
    card_lines.append("## Purpose")
    card_lines.append(purpose_value or "UNSPECIFIED")
    card_lines.append("")
    card_lines.append("## Produces (Artifacts)")
    card_lines.append(produces_value or "UNSPECIFIED")
    card_lines.append("")
    card_lines.append("## Consumes (Prereqs)")
    card_lines.append(consumes_value or "UNSPECIFIED")
    card_lines.append("")
    card_lines.append("## Interfaces Touched")

    # REST endpoints
    card_lines.append("- REST endpoints")
    if fd.rest:
        for entry in fd.rest:
            card_lines.append(f"  - {entry.name} (Source: {entry.source}) \"{entry.snippet}\"")
    else:
        src = f"{fd.rel_path}:L1-L{total_lines}"
        record_todo(todos, "REST endpoints unspecified", src)
        card_lines.append(f"  - UNSPECIFIED\n  - TODO: Document REST endpoints ({src})")

    # IPC
    card_lines.append("- IPC channels/events (if any)")
    if fd.ipc:
        for entry in fd.ipc:
            card_lines.append(f"  - {entry.name} (Source: {entry.source}) \"{entry.snippet}\"")
    else:
        src = f"{fd.rel_path}:L1-L{total_lines}"
        record_todo(todos, "IPC interfaces unspecified", src)
        card_lines.append(f"  - UNSPECIFIED\n  - TODO: Document IPC channels/events ({src})")

    # Filesystem paths/formats
    card_lines.append("- Filesystem paths/formats")
    if fd.files:
        for entry in fd.files:
            card_lines.append(f"  - {entry.name} (Source: {entry.source}) \"{entry.snippet}\"")
    else:
        src = f"{fd.rel_path}:L1-L{total_lines}"
        record_todo(todos, "Filesystem paths/formats unspecified", src)
        card_lines.append(f"  - UNSPECIFIED\n  - TODO: Document filesystem paths/formats ({src})")

    # Process lifecycle
    card_lines.append("- Process lifecycle (if any)")
    lifecycle_section, ls, le = get_section(fd, ["process", "lifecycle", "startup", "shutdown"])
    if lifecycle_section:
        card_lines.append(f"  - {lifecycle_section.strip()}".replace("\n", " "))
    else:
        src = f"{fd.rel_path}:L1-L{total_lines}"
        record_todo(todos, "Process lifecycle unspecified", src)
        card_lines.append(f"  - UNSPECIFIED\n  - TODO: Document process lifecycle ({src})")

    card_lines.append("")
    card_lines.append("## Contracts Defined or Used")
    if fd.rest or fd.ipc or fd.schemas or fd.files:
        for entry in fd.rest:
            card_lines.append(f"- REST {entry.name} (Source: {entry.source}) \"{entry.snippet}\"")
        for entry in fd.ipc:
            card_lines.append(f"- IPC {entry.name} (Source: {entry.source}) \"{entry.snippet}\"")
        for entry in fd.schemas:
            card_lines.append(f"- Schema {entry.name} (Source: {entry.source}) \"{entry.snippet}\"")
        for entry in fd.files:
            card_lines.append(f"- File {entry.name} (Source: {entry.source}) \"{entry.snippet}\"")
    else:
        src = f"{fd.rel_path}:L1-L{total_lines}"
        record_todo(todos, "Contracts unspecified", src)
        card_lines.append(f"UNSPECIFIED\nTODO: List contracts ({src})")

    card_lines.append("")
    card_lines.append("## Invariants Relied On")
    if fd.invariants:
        for entry in fd.invariants:
            card_lines.append(f"- {entry.name} (Source: {entry.source}) \"{entry.snippet}\"")
    else:
        src = f"{fd.rel_path}:L1-L{total_lines}"
        record_todo(todos, "Invariants unspecified", src)
        card_lines.append(f"UNSPECIFIED\nTODO: Add invariants ({src})")

    card_lines.append("")
    card_lines.append("## Verification Gate (Commands + Expected Outputs)")
    if fd.verifications:
        for entry in fd.verifications:
            card_lines.append(f"- {entry.name} (Source: {entry.source}) \"{entry.snippet}\"")
    else:
        src = f"{fd.rel_path}:L1-L{total_lines}"
        record_todo(todos, "Verification gate missing", src)
        card_lines.append(f"UNSPECIFIED\nTODO: Define verification gate ({src})")

    card_lines.append("")
    card_lines.append("## Risks / Unknowns (TODOs)")
    if fd.risks:
        for entry in fd.risks:
            card_lines.append(f"- {entry.name} (Source: {entry.source}) \"{entry.snippet}\"")
    else:
        src = f"{fd.rel_path}:L1-L{total_lines}"
        record_todo(todos, "Risks unspecified", src)
        card_lines.append(f"UNSPECIFIED\nTODO: Document risks ({src})")

    # Add markers to fd for scoring
    fd.has_purpose = has_purpose
    fd.has_produces = has_produces
    fd.has_consumes = has_consumes

    return "\n".join(card_lines)


def worst_color(colors: List[str]) -> str:
    if not colors:
        return "UNSPECIFIED"
    idx = max(COLOR_ORDER.index(c) if c in COLOR_ORDER else 1 for c in colors)
    return COLOR_ORDER[idx]


def compute_passes(fd: FileData) -> Dict[str, str]:
    has_verification = bool(fd.verifications)
    has_rest_or_ipc = bool(fd.rest or fd.ipc)
    has_schema = bool(fd.schemas)
    has_invariants = bool(fd.invariants)
    has_consumes = getattr(fd, "has_consumes", False)
    has_produces = getattr(fd, "has_produces", False)
    has_purpose = getattr(fd, "has_purpose", False)

    passes: Dict[str, str] = {}

    # Pass 1: Mechanical Executability
    if not has_verification:
        passes["Pass 1"] = "RED"
    elif not (has_purpose and has_produces and has_consumes):
        passes["Pass 1"] = "YELLOW"
    else:
        passes["Pass 1"] = "GREEN"

    # Pass 2: Contract Completeness
    if has_rest_or_ipc and not has_schema:
        passes["Pass 2"] = "RED"
    elif has_rest_or_ipc and has_schema:
        passes["Pass 2"] = "YELLOW"
    else:
        passes["Pass 2"] = "YELLOW"

    # Pass 3: Dependency Closure
    if not has_consumes:
        passes["Pass 3"] = "RED"
    elif not has_produces:
        passes["Pass 3"] = "YELLOW"
    else:
        passes["Pass 3"] = "GREEN"

    # Pass 4: Determinism & Data Integrity
    if has_invariants and has_verification:
        passes["Pass 4"] = "YELLOW"
    else:
        passes["Pass 4"] = "YELLOW"

    # Pass 5: Operability
    if not has_verification:
        passes["Pass 5"] = "RED"
    else:
        passes["Pass 5"] = "YELLOW"

    # Pass 6: Security & Trust Boundaries
    if has_rest_or_ipc:
        passes["Pass 6"] = "YELLOW"
    else:
        passes["Pass 6"] = "YELLOW"

    return passes


def color_overall(passes: Dict[str, str]) -> str:
    colors = list(passes.values())
    if "RED" in colors:
        return "RED"
    if "YELLOW" in colors:
        return "YELLOW"
    if "GREEN" in colors:
        return "GREEN"
    return "UNSPECIFIED"


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.rstrip() + "\n", encoding="utf-8")


def build_contract_registry(all_files: List[FileData], todos: List[str]) -> str:
    lines: List[str] = []
    lines.append("# Contract Registry")
    lines.append("")
    lines.append("## REST Contracts")
    if any(fd.rest for fd in all_files):
        for fd in all_files:
            for entry in fd.rest:
                lines.append(f"- {entry.name}")
                lines.append(f"  - Request schema: UNSPECIFIED (TODO {entry.source})")
                lines.append(f"  - Response schema: UNSPECIFIED (TODO {entry.source})")
                lines.append(f"  - Error shape: UNSPECIFIED (TODO {entry.source})")
                lines.append(f"  - Owner: UNSPECIFIED (TODO {entry.source})")
                lines.append(f"  - Source: {entry.source} \"{entry.snippet}\"")
                record_todo(todos, f"Contract details missing for {entry.name}", entry.source)
    else:
        lines.append("None found.")

    lines.append("")
    lines.append("## IPC Contracts")
    if any(fd.ipc for fd in all_files):
        for fd in all_files:
            for entry in fd.ipc:
                lines.append(f"- {entry.name}")
                lines.append(f"  - Payload schema: UNSPECIFIED (TODO {entry.source})")
                lines.append(f"  - Direction: UNSPECIFIED (TODO {entry.source})")
                lines.append(f"  - Owner: UNSPECIFIED (TODO {entry.source})")
                lines.append(f"  - Source: {entry.source} \"{entry.snippet}\"")
                record_todo(todos, f"IPC contract incomplete for {entry.name}", entry.source)
    else:
        lines.append("None found.")

    lines.append("")
    lines.append("## Schema Contracts")
    if any(fd.schemas for fd in all_files):
        for fd in all_files:
            for entry in fd.schemas:
                lines.append(f"- {entry.name}")
                lines.append(f"  - Fields: UNSPECIFIED (TODO {entry.source})")
                lines.append(f"  - Owner: UNSPECIFIED (TODO {entry.source})")
                lines.append(f"  - Source: {entry.source} \"{entry.snippet}\"")
                record_todo(todos, f"Schema fields unspecified for {entry.name}", entry.source)
    else:
        lines.append("None found.")

    lines.append("")
    lines.append("## File Contracts")
    if any(fd.files for fd in all_files):
        for fd in all_files:
            for entry in fd.files:
                lines.append(f"- {entry.name}")
                lines.append(f"  - Directory/naming rules: UNSPECIFIED (TODO {entry.source})")
                lines.append(f"  - Owner: UNSPECIFIED (TODO {entry.source})")
                lines.append(f"  - Source: {entry.source} \"{entry.snippet}\"")
                record_todo(todos, f"File contract details unspecified for {entry.name}", entry.source)
    else:
        lines.append("None found.")

    return "\n".join(lines)


def build_interface_atlas(all_files: List[FileData], todos: List[str]) -> str:
    lines: List[str] = []
    lines.append("# Interface Atlas")
    lines.append("")
    lines.append("| From | To | Interface Type (REST/IPC/FS/ProcessIO) | Contract Name | Owner | Validator | Source |")
    lines.append("| --- | --- | --- | --- | --- | --- | --- |")
    any_rows = False
    for fd in all_files:
        for entry in fd.rest:
            any_rows = True
            record_todo(todos, f"Owner/Validator unspecified for {entry.name}", entry.source)
            lines.append(
                f"| UNSPECIFIED | UNSPECIFIED | REST | {entry.name} | UNSPECIFIED | UNSPECIFIED | {entry.source} |"
            )
        for entry in fd.ipc:
            any_rows = True
            record_todo(todos, f"Owner/Validator unspecified for IPC {entry.name}", entry.source)
            lines.append(
                f"| UNSPECIFIED | UNSPECIFIED | IPC | {entry.name} | UNSPECIFIED | UNSPECIFIED | {entry.source} |"
            )
        for entry in fd.files:
            any_rows = True
            record_todo(todos, f"Owner/Validator unspecified for file contract {entry.name}", entry.source)
            lines.append(
                f"| UNSPECIFIED | UNSPECIFIED | FS | {entry.name} | UNSPECIFIED | UNSPECIFIED | {entry.source} |"
            )
    if not any_rows:
        lines.append("| None | None | None | None | None | None | None |")
    return "\n".join(lines)


def build_invariant_catalog(all_files: List[FileData]) -> Tuple[str, List[DetectedEntry]]:
    lines: List[str] = []
    invariants: List[DetectedEntry] = []
    for fd in all_files:
        invariants.extend(fd.invariants)
    lines.append("# Invariant Catalog")
    lines.append("")
    if invariants:
        for idx, inv in enumerate(invariants, 1):
            inv_id = f"INV-{idx:03d}"
            lines.append(f"{inv_id}")
            lines.append(f"- Statement: {inv.name}")
            lines.append(f"- Applies To: {inv.file}")
            lines.append(f"- Enforcement point: UNSPECIFIED")
            lines.append(f"- Proof/Test: UNSPECIFIED")
            lines.append(f"- Source: {inv.source} \"{inv.snippet}\"")
            lines.append("")
    else:
        lines.append("None found.")
    return "\n".join(lines).rstrip(), invariants


def build_verification_gate_index(runbook_files: List[FileData], todos: List[str]) -> Tuple[str, List[str]]:
    lines: List[str] = []
    missing_gates: List[str] = []
    lines.append("# Verification Gate Index")
    lines.append("")
    for fd in runbook_files:
        lines.append(f"## {fd.rel_path}")
        if fd.verifications:
            for entry in fd.verifications:
                lines.append(f"- Command: {entry.name}")
                lines.append(f"  - Expected outcome: UNSPECIFIED (TODO {entry.source})")
                record_todo(todos, f"Expected outcome unspecified for {entry.name}", entry.source)
        else:
            lines.append("- MISSING VERIFICATION GATE (RED)")
            src = f"{fd.rel_path}:L1-L{len(fd.lines) or 1}"
            record_todo(todos, "Verification gate missing", src)
            missing_gates.append(fd.rel_path)
        lines.append("")
    return "\n".join(lines).rstrip(), missing_gates


def build_risk_register(all_files: List[FileData]) -> Tuple[str, List[DetectedEntry]]:
    lines: List[str] = []
    risks: List[DetectedEntry] = []
    for fd in all_files:
        risks.extend(fd.risks)
    lines.append("# Risk Register")
    lines.append("")
    if risks:
        for idx, risk in enumerate(risks, 1):
            risk_id = f"R-{idx:03d}"
            lines.append(f"{risk_id}")
            lines.append(f"- Description: {risk.name}")
            lines.append(f"- Trigger / failure mode: UNSPECIFIED")
            lines.append(f"- Impact: UNSPECIFIED")
            lines.append(f"- Mitigation: UNSPECIFIED")
            lines.append(f"- Verification: UNSPECIFIED")
            lines.append(f"- Runbooks impacted: {risk.file}")
            lines.append(f"- Source: {risk.source} \"{risk.snippet}\"")
            lines.append("")
    else:
        lines.append("None found.")
    return "\n".join(lines).rstrip(), risks


def build_ryg_report(runbook_files: List[FileData], passes_by_file: Dict[str, Dict[str, str]], missing_contracts: List[str], missing_gates: List[str], risks: List[DetectedEntry]) -> str:
    lines: List[str] = []
    lines.append("# RYG Audit Report")
    lines.append("")
    lines.append("## Summary")
    header = ["Runbook", "Pass 1", "Pass 2", "Pass 3", "Pass 4", "Pass 5", "Pass 6", "Overall"]
    lines.append("| " + " | ".join(header) + " |")
    lines.append("| " + " | ".join(["---"] * len(header)) + " |")
    blocking_fixes: List[str] = []
    for fd in runbook_files:
        pass_scores = passes_by_file.get(fd.rel_path, {})
        overall = color_overall(pass_scores)
        row = [fd.rel_path]
        for k in ["Pass 1", "Pass 2", "Pass 3", "Pass 4", "Pass 5", "Pass 6"]:
            score = pass_scores.get(k, "UNSPECIFIED")
            row.append(score)
            if score == "RED":
                blocking_fixes.append(f"{fd.rel_path} {k} RED ({fd.rel_path}:L1-L{len(fd.lines) or 1})")
        row.append(overall)
        lines.append("| " + " | ".join(row) + " |")

    lines.append("")
    lines.append("## Blocking Fixes")
    if blocking_fixes:
        for item in blocking_fixes:
            lines.append(f"- {item}")
    else:
        lines.append("- None identified.")

    lines.append("")
    lines.append("## Top 10 missing contracts")
    if missing_contracts:
        for item in missing_contracts[:10]:
            lines.append(f"- {item}")
    else:
        lines.append("- None identified.")

    lines.append("")
    lines.append("## Top 10 missing verification gates")
    if missing_gates:
        for item in missing_gates[:10]:
            lines.append(f"- {item}")
    else:
        lines.append("- None identified.")

    lines.append("")
    lines.append("## Top 10 global risks")
    if risks:
        for entry in risks[:10]:
            lines.append(f"- {entry.name} (Source: {entry.source})")
    else:
        lines.append("- None identified.")

    return "\n".join(lines)


def build_open_todos(todos: List[str]) -> str:
    lines: List[str] = []
    lines.append("# Open TODOs")
    lines.append("")
    if todos:
        unique = []
        seen = set()
        for t in todos:
            if t not in seen:
                unique.append(t)
                seen.add(t)
        for item in unique:
            lines.append(f"- {item}")
    else:
        lines.append("- None.")
    return "\n".join(lines)


def build_audit_summary_json(runbook_files: List[FileData], passes_by_file: Dict[str, Dict[str, str]], blocking_fixes: List[str], missing_contracts: List[str], missing_gates: List[str], risks: List[DetectedEntry], todos: List[str]) -> str:
    runbooks_summary = []
    for fd in runbook_files:
        runbooks_summary.append(
            {
                "name": Path(fd.rel_path).name,
                "path": fd.rel_path,
                "number": fd.runbook_number,
                "passes": passes_by_file.get(fd.rel_path, {}),
                "overall": color_overall(passes_by_file.get(fd.rel_path, {})),
                "has_verification": bool(fd.verifications),
                "has_contracts": bool(fd.rest or fd.ipc or fd.schemas or fd.files),
                "has_invariants": bool(fd.invariants),
            }
        )

    data = {
        "runbooks": runbooks_summary,
        "blocking_fixes": blocking_fixes,
        "top_missing_contracts": missing_contracts[:10],
        "top_missing_verification_gates": missing_gates[:10],
        "global_risks": [
            {
                "id": f"R-{idx+1:03d}",
                "description": r.name,
                "source": r.source,
                "snippet": r.snippet,
            }
            for idx, r in enumerate(risks[:10])
        ],
        "todos": todos,
    }
    return json.dumps(data, indent=2)


def main() -> None:
    ensure_dirs()
    files = discover_files()
    for fd in files:
        scan_file(fd)

    runbook_files = [fd for fd in files if fd.is_runbook]
    todos: List[str] = []

    # Build runbook cards
    for fd in runbook_files:
        card_content = build_runbook_card(fd, todos)
        number = fd.runbook_number if fd.runbook_number is not None else "UNKNOWN"
        card_path = OUTPUT_ROOT / "runbook_cards" / f"RUNBOOK_{number}_CARD.md"
        write_file(card_path, card_content)

    # Registries
    contract_registry = build_contract_registry(files, todos)
    write_file(OUTPUT_ROOT / "registries" / "CONTRACT_REGISTRY.md", contract_registry)

    interface_atlas = build_interface_atlas(files, todos)
    write_file(OUTPUT_ROOT / "registries" / "INTERFACE_ATLAS.md", interface_atlas)

    invariant_catalog, invariants_list = build_invariant_catalog(files)
    write_file(OUTPUT_ROOT / "registries" / "INVARIANT_CATALOG.md", invariant_catalog)

    verification_gate_index, missing_gates = build_verification_gate_index(runbook_files, todos)
    write_file(OUTPUT_ROOT / "registries" / "VERIFICATION_GATE_INDEX.md", verification_gate_index)

    risk_register, risk_entries = build_risk_register(files)
    write_file(OUTPUT_ROOT / "registries" / "RISK_REGISTER.md", risk_register)

    # Passes and reports
    passes_by_file: Dict[str, Dict[str, str]] = {}
    for fd in runbook_files:
        passes_by_file[fd.rel_path] = compute_passes(fd)

    missing_contracts = [f"{e.name} ({e.source})" for fd in files for e in fd.rest if not fd.schemas]
    ryg_report = build_ryg_report(runbook_files, passes_by_file, missing_contracts, missing_gates, risk_entries)
    write_file(OUTPUT_ROOT / "reports" / "RYG_AUDIT_REPORT.md", ryg_report)

    open_todos_content = build_open_todos(todos)
    write_file(OUTPUT_ROOT / "reports" / "OPEN_TODOS.md", open_todos_content)

    blocking_fixes = []
    for fd in runbook_files:
        for k, v in passes_by_file.get(fd.rel_path, {}).items():
            if v == "RED":
                blocking_fixes.append(f"{fd.rel_path} {k} RED ({fd.rel_path}:L1-L{len(fd.lines) or 1})")

    audit_summary = build_audit_summary_json(runbook_files, passes_by_file, blocking_fixes, missing_contracts, missing_gates, risk_entries, todos)
    write_file(OUTPUT_ROOT / "reports" / "audit_summary.json", audit_summary)


if __name__ == "__main__":
    main()
