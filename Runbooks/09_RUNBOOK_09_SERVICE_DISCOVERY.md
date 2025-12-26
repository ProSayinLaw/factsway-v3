# Runbook 9: Service Discovery & Configuration

**Phase:** Integration (Critical Path)  
**Estimated Time:** 6-8 hours  
**Prerequisites:** Runbooks 1-8 complete (services + orchestrator + renderer)  
**Depends On:** Runbook 0 Sections 23, 22.2-22.4  
**Enables:** Runbook 10 (packaging), cross-environment testing

---

## Objective

Create the **Service Discovery & Configuration** system that enables the same codebase to run in Desktop (localhost), Cloud (Kubernetes), and Enterprise (on-premise) deployments through environment-based service URL injection.

**Success Criteria:**
- ✅ Services discover each other via environment variables
- ✅ Desktop uses localhost URLs
- ✅ Cloud uses Kubernetes service DNS
- ✅ Enterprise uses configurable base URL
- ✅ Health check aggregation working
- ✅ Configuration validation at startup
- ✅ No hardcoded URLs in service code
- ✅ Environment switching works without code changes

---

## Context from Runbook 0

**Referenced Sections:**
- **Section 23:** Service Discovery & Configuration
  - **Section 23.1:** Overview (environment-based configuration)
  - **Section 23.2:** Configuration Strategy
  - **Section 23.3:** Service Code Pattern
  - **Section 23.4:** Orchestrator Injection (Desktop)
  - **Section 23.5:** Kubernetes Injection (Cloud)
  - **Section 23.6:** Validation
- **Section 22.2:** Desktop Deployment (localhost services)
- **Section 22.3:** Cloud Deployment (Kubernetes DNS)
- **Section 22.4:** Enterprise Deployment (configurable base URL)

**Key Principle from Runbook 0:**
> "Services must never hardcode URLs. All inter-service communication uses URLs injected via environment variables at startup. This enables the same service code to run in Desktop (localhost), Cloud (Kubernetes service names), or Enterprise (custom base URLs) without modification."

---

## Current State

**What exists:**
- ✅ All 8 backend services (Runbooks 3-7)
- ✅ Desktop orchestrator spawning services (Runbook 7)
- ✅ Renderer with IPC communication (Runbook 8)
- ❌ No environment-based configuration
- ❌ Services have hardcoded localhost URLs
- ❌ No health check aggregation
- ❌ No configuration validation

**What this creates:**
- ✅ Environment variable schema for all deployments
- ✅ Configuration loader for each service
- ✅ Service registry (maps service names → URLs)
- ✅ Health check aggregator
- ✅ Validation functions for startup checks
- ✅ Desktop orchestrator environment injection
- ✅ Kubernetes ConfigMap/Service definitions
- ✅ Enterprise .env template

---

## Task 1: Configuration Schema Definition

### 1.1 Environment Variable Schema

**File:** `packages/shared-types/src/config/environment.types.ts`

**Action:** CREATE

**Purpose:** Type-safe environment configuration schema

**Content:**
```typescript
/**
 * Environment Configuration Schema
 * 
 * Reference: Runbook 0 Section 23.2
 * 
 * All services use these environment variables for service discovery.
 * Values are injected by orchestrator (Desktop), Kubernetes (Cloud),
 * or .env file (Enterprise).
 */

export type DeploymentEnvironment = 'desktop' | 'cloud' | 'enterprise';

/**
 * Service URLs Configuration
 * 
 * Each service gets these environment variables at startup
 */
export interface ServiceURLsConfig {
  // Records Service (port 3001)
  RECORDS_SERVICE_URL: string;
  
  // Ingestion Service (port 3002)
  INGESTION_SERVICE_URL: string;
  
  // Export Service (port 3003)
  EXPORT_SERVICE_URL: string;
  
  // CaseBlock Service (port 3004)
  CASEBLOCK_SERVICE_URL: string;
  
  // Signature Service (port 3005)
  SIGNATURE_SERVICE_URL: string;
  
  // Facts Service (port 3006)
  FACTS_SERVICE_URL: string;
  
  // Exhibits Service (port 3007)
  EXHIBITS_SERVICE_URL: string;
  
  // Caselaw Service (port 3008)
  CASELAW_SERVICE_URL: string;
}

/**
 * Service-Specific Configuration
 * 
 * Each service also receives its own configuration
 */
export interface ServiceConfig {
  // Deployment environment
  DEPLOYMENT_ENV: DeploymentEnvironment;
  
  // This service's port
  PORT: number;
  
  // This service's name
  SERVICE_NAME: string;
  
  // Database URL (SQLite for desktop, PostgreSQL for cloud/enterprise)
  DATABASE_URL?: string;
  
  // Log level
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
  
  // Service URLs (from ServiceURLsConfig)
  SERVICE_URLS: ServiceURLsConfig;
}

/**
 * Desktop-Specific Configuration
 */
export interface DesktopConfig extends ServiceConfig {
  DEPLOYMENT_ENV: 'desktop';
  
  // Path to user data directory
  USER_DATA_DIR: string;
  
  // Path to SQLite database
  SQLITE_PATH: string;
  
  // Electron app version
  APP_VERSION: string;
}

/**
 * Cloud-Specific Configuration
 */
export interface CloudConfig extends ServiceConfig {
  DEPLOYMENT_ENV: 'cloud';
  
  // PostgreSQL connection
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  
  // Cloud provider
  CLOUD_PROVIDER?: 'aws' | 'gcp' | 'azure';
  
  // Kubernetes namespace
  K8S_NAMESPACE?: string;
}

/**
 * Enterprise-Specific Configuration
 */
export interface EnterpriseConfig extends ServiceConfig {
  DEPLOYMENT_ENV: 'enterprise';
  
  // PostgreSQL connection
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  
  // Base URL for all services (if behind proxy)
  BASE_URL?: string;
  
  // TLS/SSL configuration
  TLS_ENABLED?: boolean;
  TLS_CERT_PATH?: string;
  TLS_KEY_PATH?: string;
}

/**
 * Health Check Response
 */
export interface ServiceHealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  url: string;
  responseTime?: number;
  error?: string;
  timestamp: string;
}

/**
 * Aggregated Health Status
 */
export interface AggregatedHealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealthCheck[];
  timestamp: string;
}
```

---

### 1.2 Configuration Validator

**File:** `packages/shared-types/src/config/validator.ts`

**Action:** CREATE

**Purpose:** Validate configuration at service startup

**Content:**
```typescript
import type {
  ServiceConfig,
  ServiceURLsConfig,
  DeploymentEnvironment
} from './environment.types';

/**
 * Configuration Validation
 * 
 * Reference: Runbook 0 Section 23.6
 * 
 * Services validate configuration at startup.
 * Fail fast if required variables are missing.
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate Service URLs Configuration
 */
export function validateServiceURLs(
  config: Partial<ServiceURLsConfig>
): ValidationResult {
  const errors: ValidationError[] = [];
  
  const requiredServices = [
    'RECORDS_SERVICE_URL',
    'INGESTION_SERVICE_URL',
    'EXPORT_SERVICE_URL',
    'CASEBLOCK_SERVICE_URL',
    'SIGNATURE_SERVICE_URL',
    'FACTS_SERVICE_URL',
    'EXHIBITS_SERVICE_URL',
    'CASELAW_SERVICE_URL'
  ] as const;
  
  for (const service of requiredServices) {
    if (!config[service]) {
      errors.push({
        field: service,
        message: `Missing required environment variable: ${service}`
      });
    } else if (!isValidURL(config[service]!)) {
      errors.push({
        field: service,
        message: `Invalid URL format for ${service}: ${config[service]}`
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate Service-Specific Configuration
 */
export function validateServiceConfig(
  config: Partial<ServiceConfig>
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!config.DEPLOYMENT_ENV) {
    errors.push({
      field: 'DEPLOYMENT_ENV',
      message: 'Missing required environment variable: DEPLOYMENT_ENV'
    });
  } else if (!['desktop', 'cloud', 'enterprise'].includes(config.DEPLOYMENT_ENV)) {
    errors.push({
      field: 'DEPLOYMENT_ENV',
      message: `Invalid DEPLOYMENT_ENV: ${config.DEPLOYMENT_ENV}. Must be 'desktop', 'cloud', or 'enterprise'`
    });
  }
  
  if (!config.PORT) {
    errors.push({
      field: 'PORT',
      message: 'Missing required environment variable: PORT'
    });
  } else if (typeof config.PORT !== 'number' || config.PORT < 1 || config.PORT > 65535) {
    errors.push({
      field: 'PORT',
      message: `Invalid PORT: ${config.PORT}. Must be between 1-65535`
    });
  }
  
  if (!config.SERVICE_NAME) {
    errors.push({
      field: 'SERVICE_NAME',
      message: 'Missing required environment variable: SERVICE_NAME'
    });
  }
  
  // Validate service URLs if present
  if (config.SERVICE_URLS) {
    const urlValidation = validateServiceURLs(config.SERVICE_URLS);
    errors.push(...urlValidation.errors);
  } else {
    errors.push({
      field: 'SERVICE_URLS',
      message: 'Missing required configuration: SERVICE_URLS'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate Desktop-Specific Configuration
 */
export function validateDesktopConfig(
  config: Partial<ServiceConfig>
): ValidationResult {
  const baseValidation = validateServiceConfig(config);
  const errors = [...baseValidation.errors];
  
  // Desktop-specific checks
  const desktopConfig = config as any;
  
  if (!desktopConfig.USER_DATA_DIR) {
    errors.push({
      field: 'USER_DATA_DIR',
      message: 'Missing required environment variable: USER_DATA_DIR'
    });
  }
  
  if (!desktopConfig.SQLITE_PATH) {
    errors.push({
      field: 'SQLITE_PATH',
      message: 'Missing required environment variable: SQLITE_PATH'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate Cloud-Specific Configuration
 */
export function validateCloudConfig(
  config: Partial<ServiceConfig>
): ValidationResult {
  const baseValidation = validateServiceConfig(config);
  const errors = [...baseValidation.errors];
  
  // Cloud-specific checks
  const cloudConfig = config as any;
  
  const requiredPostgresVars = [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD'
  ];
  
  for (const varName of requiredPostgresVars) {
    if (!cloudConfig[varName]) {
      errors.push({
        field: varName,
        message: `Missing required environment variable: ${varName}`
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Helper: Check if string is valid URL
 */
function isValidURL(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Format validation errors for logging
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(err => `  - ${err.field}: ${err.message}`).join('\n');
}
```

---

## Task 2: Configuration Loader for Services

### 2.1 Python Configuration Loader

**File:** `packages/shared-utils/python/config_loader.py`

**Action:** CREATE

**Purpose:** Load and validate configuration for Python services

**Content:**
```python
"""
Configuration Loader for Python Services

Reference: Runbook 0 Section 23.3

All Python services (Ingestion, Export, CaseBlock, Signature, Facts, Exhibits, Caselaw)
use this loader to get configuration from environment variables.
"""

import os
from typing import Optional, Dict, Any
from dataclasses import dataclass
from enum import Enum


class DeploymentEnvironment(Enum):
    DESKTOP = "desktop"
    CLOUD = "cloud"
    ENTERPRISE = "enterprise"


@dataclass
class ServiceURLs:
    """URLs for all backend services"""
    records: str
    ingestion: str
    export: str
    caseblock: str
    signature: str
    facts: str
    exhibits: str
    caselaw: str
    
    @classmethod
    def from_env(cls) -> 'ServiceURLs':
        """Load service URLs from environment variables"""
        return cls(
            records=os.environ['RECORDS_SERVICE_URL'],
            ingestion=os.environ['INGESTION_SERVICE_URL'],
            export=os.environ['EXPORT_SERVICE_URL'],
            caseblock=os.environ['CASEBLOCK_SERVICE_URL'],
            signature=os.environ['SIGNATURE_SERVICE_URL'],
            facts=os.environ['FACTS_SERVICE_URL'],
            exhibits=os.environ['EXHIBITS_SERVICE_URL'],
            caselaw=os.environ['CASELAW_SERVICE_URL']
        )


@dataclass
class ServiceConfig:
    """Base configuration for all services"""
    deployment_env: DeploymentEnvironment
    port: int
    service_name: str
    log_level: str
    service_urls: ServiceURLs
    database_url: Optional[str] = None
    
    @classmethod
    def from_env(cls) -> 'ServiceConfig':
        """Load configuration from environment variables"""
        return cls(
            deployment_env=DeploymentEnvironment(os.environ['DEPLOYMENT_ENV']),
            port=int(os.environ['PORT']),
            service_name=os.environ['SERVICE_NAME'],
            log_level=os.environ.get('LOG_LEVEL', 'info'),
            service_urls=ServiceURLs.from_env(),
            database_url=os.environ.get('DATABASE_URL')
        )


class ConfigurationError(Exception):
    """Raised when configuration is invalid or missing"""
    pass


def validate_service_urls(urls: ServiceURLs) -> None:
    """
    Validate that all service URLs are present and valid
    
    Raises ConfigurationError if validation fails
    """
    errors = []
    
    for service_name, url in vars(urls).items():
        if not url:
            errors.append(f"Missing URL for {service_name} service")
        elif not url.startswith(('http://', 'https://')):
            errors.append(f"Invalid URL for {service_name} service: {url}")
    
    if errors:
        raise ConfigurationError(
            "Service URL validation failed:\n" + "\n".join(f"  - {err}" for err in errors)
        )


def validate_config(config: ServiceConfig) -> None:
    """
    Validate complete service configuration
    
    Raises ConfigurationError if validation fails
    """
    errors = []
    
    # Validate port
    if not (1 <= config.port <= 65535):
        errors.append(f"Invalid port: {config.port}")
    
    # Validate service name
    if not config.service_name:
        errors.append("Missing service name")
    
    # Validate deployment environment
    if config.deployment_env not in DeploymentEnvironment:
        errors.append(f"Invalid deployment environment: {config.deployment_env}")
    
    if errors:
        raise ConfigurationError(
            "Configuration validation failed:\n" + "\n".join(f"  - {err}" for err in errors)
        )
    
    # Validate service URLs
    validate_service_urls(config.service_urls)


def load_config() -> ServiceConfig:
    """
    Load and validate service configuration
    
    This is the main entry point for all Python services.
    
    Returns:
        ServiceConfig: Validated configuration object
        
    Raises:
        ConfigurationError: If required environment variables are missing or invalid
    """
    try:
        config = ServiceConfig.from_env()
        validate_config(config)
        return config
    except KeyError as e:
        raise ConfigurationError(f"Missing required environment variable: {e}")
    except ValueError as e:
        raise ConfigurationError(f"Invalid environment variable value: {e}")


# Usage in services:
#
# from config_loader import load_config
#
# config = load_config()
# print(f"Starting {config.service_name} on port {config.port}")
# print(f"Deployment: {config.deployment_env.value}")
# print(f"Records service: {config.service_urls.records}")
```

---

### 2.2 Node/TypeScript Configuration Loader

**File:** `packages/shared-utils/src/config/loader.ts`

**Action:** CREATE

**Purpose:** Load and validate configuration for Node services

**Content:**
```typescript
/**
 * Configuration Loader for Node/TypeScript Services
 * 
 * Reference: Runbook 0 Section 23.3
 * 
 * Records Service (only Node service) uses this loader.
 */

import {
  ServiceConfig,
  ServiceURLsConfig,
  DeploymentEnvironment,
  DesktopConfig,
  CloudConfig,
  EnterpriseConfig
} from '@factsway/shared-types/config/environment.types';

import {
  validateServiceConfig,
  validateDesktopConfig,
  validateCloudConfig,
  formatValidationErrors
} from '@factsway/shared-types/config/validator';

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Load Service URLs from environment
 */
function loadServiceURLs(): ServiceURLsConfig {
  return {
    RECORDS_SERVICE_URL: process.env.RECORDS_SERVICE_URL!,
    INGESTION_SERVICE_URL: process.env.INGESTION_SERVICE_URL!,
    EXPORT_SERVICE_URL: process.env.EXPORT_SERVICE_URL!,
    CASEBLOCK_SERVICE_URL: process.env.CASEBLOCK_SERVICE_URL!,
    SIGNATURE_SERVICE_URL: process.env.SIGNATURE_SERVICE_URL!,
    FACTS_SERVICE_URL: process.env.FACTS_SERVICE_URL!,
    EXHIBITS_SERVICE_URL: process.env.EXHIBITS_SERVICE_URL!,
    CASELAW_SERVICE_URL: process.env.CASELAW_SERVICE_URL!
  };
}

/**
 * Load base Service Configuration from environment
 */
function loadBaseConfig(): ServiceConfig {
  return {
    DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV as DeploymentEnvironment,
    PORT: parseInt(process.env.PORT || '3001', 10),
    SERVICE_NAME: process.env.SERVICE_NAME || 'unknown',
    DATABASE_URL: process.env.DATABASE_URL,
    LOG_LEVEL: (process.env.LOG_LEVEL || 'info') as any,
    SERVICE_URLS: loadServiceURLs()
  };
}

/**
 * Load Desktop Configuration
 */
function loadDesktopConfig(): DesktopConfig {
  const base = loadBaseConfig();
  
  return {
    ...base,
    DEPLOYMENT_ENV: 'desktop',
    USER_DATA_DIR: process.env.USER_DATA_DIR!,
    SQLITE_PATH: process.env.SQLITE_PATH!,
    APP_VERSION: process.env.APP_VERSION || '1.0.0'
  };
}

/**
 * Load Cloud Configuration
 */
function loadCloudConfig(): CloudConfig {
  const base = loadBaseConfig();
  
  return {
    ...base,
    DEPLOYMENT_ENV: 'cloud',
    POSTGRES_HOST: process.env.POSTGRES_HOST!,
    POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    POSTGRES_DB: process.env.POSTGRES_DB!,
    POSTGRES_USER: process.env.POSTGRES_USER!,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD!,
    CLOUD_PROVIDER: process.env.CLOUD_PROVIDER as any,
    K8S_NAMESPACE: process.env.K8S_NAMESPACE
  };
}

/**
 * Load Enterprise Configuration
 */
function loadEnterpriseConfig(): EnterpriseConfig {
  const base = loadBaseConfig();
  
  return {
    ...base,
    DEPLOYMENT_ENV: 'enterprise',
    POSTGRES_HOST: process.env.POSTGRES_HOST!,
    POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    POSTGRES_DB: process.env.POSTGRES_DB!,
    POSTGRES_USER: process.env.POSTGRES_USER!,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD!,
    BASE_URL: process.env.BASE_URL,
    TLS_ENABLED: process.env.TLS_ENABLED === 'true',
    TLS_CERT_PATH: process.env.TLS_CERT_PATH,
    TLS_KEY_PATH: process.env.TLS_KEY_PATH
  };
}

/**
 * Main Configuration Loader
 * 
 * Loads configuration based on DEPLOYMENT_ENV and validates it.
 * 
 * @throws ConfigurationError if validation fails
 */
export function loadConfig(): ServiceConfig {
  try {
    const deploymentEnv = process.env.DEPLOYMENT_ENV as DeploymentEnvironment;
    
    if (!deploymentEnv) {
      throw new ConfigurationError('Missing required environment variable: DEPLOYMENT_ENV');
    }
    
    let config: ServiceConfig;
    let validation;
    
    switch (deploymentEnv) {
      case 'desktop':
        config = loadDesktopConfig();
        validation = validateDesktopConfig(config);
        break;
        
      case 'cloud':
        config = loadCloudConfig();
        validation = validateCloudConfig(config);
        break;
        
      case 'enterprise':
        config = loadEnterpriseConfig();
        validation = validateCloudConfig(config); // Same validation as cloud
        break;
        
      default:
        throw new ConfigurationError(
          `Invalid DEPLOYMENT_ENV: ${deploymentEnv}. Must be 'desktop', 'cloud', or 'enterprise'`
        );
    }
    
    if (!validation.valid) {
      throw new ConfigurationError(
        `Configuration validation failed:\n${formatValidationErrors(validation.errors)}`
      );
    }
    
    return config;
    
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
    throw new ConfigurationError(`Failed to load configuration: ${error}`);
  }
}

/**
 * Get Service URL by name
 * 
 * Helper to access service URLs in a type-safe way
 */
export function getServiceURL(
  config: ServiceConfig,
  serviceName: keyof ServiceURLsConfig
): string {
  return config.SERVICE_URLS[serviceName];
}

// Usage in services:
//
// import { loadConfig, getServiceURL } from '@factsway/shared-utils/config/loader';
//
// const config = loadConfig();
// console.log(`Starting ${config.SERVICE_NAME} on port ${config.PORT}`);
// console.log(`Deployment: ${config.DEPLOYMENT_ENV}`);
//
// const recordsURL = getServiceURL(config, 'RECORDS_SERVICE_URL');
```

---

## Task 3: Desktop Orchestrator Configuration Injection

### 3.1 Service Environment Generator

**File:** `desktop/main/services/environment.ts`

**Action:** CREATE

**Purpose:** Generate environment variables for spawned services

**Content:**
```typescript
/**
 * Service Environment Generator for Desktop Deployment
 * 
 * Reference: Runbook 0 Section 23.4
 * 
 * Orchestrator injects environment variables when spawning child processes.
 * All services get localhost URLs for inter-service communication.
 */

import { app } from 'electron';
import path from 'path';
import type { ServiceURLsConfig } from '@factsway/shared-types/config/environment.types';

/**
 * Service Port Mapping
 * 
 * Fixed ports for desktop deployment
 */
export const SERVICE_PORTS = {
  records: 3001,
  ingestion: 3002,
  export: 3003,
  caseblock: 3004,
  signature: 3005,
  facts: 3006,
  exhibits: 3007,
  caselaw: 3008
} as const;

/**
 * Generate Service URLs for Desktop
 * 
 * All services use localhost with fixed ports
 */
export function generateServiceURLs(): ServiceURLsConfig {
  return {
    RECORDS_SERVICE_URL: `http://localhost:${SERVICE_PORTS.records}`,
    INGESTION_SERVICE_URL: `http://localhost:${SERVICE_PORTS.ingestion}`,
    EXPORT_SERVICE_URL: `http://localhost:${SERVICE_PORTS.export}`,
    CASEBLOCK_SERVICE_URL: `http://localhost:${SERVICE_PORTS.caseblock}`,
    SIGNATURE_SERVICE_URL: `http://localhost:${SERVICE_PORTS.signature}`,
    FACTS_SERVICE_URL: `http://localhost:${SERVICE_PORTS.facts}`,
    EXHIBITS_SERVICE_URL: `http://localhost:${SERVICE_PORTS.exhibits}`,
    CASELAW_SERVICE_URL: `http://localhost:${SERVICE_PORTS.caselaw}`
  };
}

/**
 * Generate environment variables for a specific service
 * 
 * @param serviceName - Name of the service to generate env for
 * @returns Environment object to pass to child_process.spawn
 */
export function generateServiceEnvironment(
  serviceName: string,
  port: number
): NodeJS.ProcessEnv {
  const serviceURLs = generateServiceURLs();
  const userDataPath = app.getPath('userData');
  const sqlitePath = path.join(userDataPath, 'factsway.db');
  
  return {
    // Inherit parent process env (PATH, etc.)
    ...process.env,
    
    // Deployment configuration
    DEPLOYMENT_ENV: 'desktop',
    PORT: port.toString(),
    SERVICE_NAME: serviceName,
    
    // Desktop-specific paths
    USER_DATA_DIR: userDataPath,
    SQLITE_PATH: sqlitePath,
    DATABASE_URL: `sqlite:///${sqlitePath}`,
    
    // App metadata
    APP_VERSION: app.getVersion(),
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Service URLs (all 8 services)
    ...serviceURLs
  };
}

/**
 * Get service environment for all services
 * 
 * Returns a map of service name → environment object
 */
export function generateAllServiceEnvironments(): Map<string, NodeJS.ProcessEnv> {
  const environments = new Map<string, NodeJS.ProcessEnv>();
  
  const services = [
    { name: 'records', port: SERVICE_PORTS.records },
    { name: 'ingestion', port: SERVICE_PORTS.ingestion },
    { name: 'export', port: SERVICE_PORTS.export },
    { name: 'caseblock', port: SERVICE_PORTS.caseblock },
    { name: 'signature', port: SERVICE_PORTS.signature },
    { name: 'facts', port: SERVICE_PORTS.facts },
    { name: 'exhibits', port: SERVICE_PORTS.exhibits },
    { name: 'caselaw', port: SERVICE_PORTS.caselaw }
  ];
  
  for (const service of services) {
    environments.set(
      service.name,
      generateServiceEnvironment(service.name, service.port)
    );
  }
  
  return environments;
}
```

---

### 3.2 Update Service Manager to Use Environment Injection

**File:** `desktop/main/services/manager.ts` (UPDATE)

**Action:** MODIFY existing file from Runbook 7

**Add to spawn command:**
```typescript
import { generateServiceEnvironment, SERVICE_PORTS } from './environment';

// Inside startService() function, update spawn call:

const env = generateServiceEnvironment(serviceName, SERVICE_PORTS[serviceName]);

const process = spawn(executable, args, {
  env, // ← Add this
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: false
});
```

---

## Task 4: Health Check Aggregator

### 4.1 Health Check Service

**File:** `desktop/main/services/health-check.ts`

**Action:** CREATE

**Purpose:** Aggregate health status from all services

**Content:**
```typescript
/**
 * Health Check Aggregator
 * 
 * Reference: Runbook 0 Section 23.6
 * 
 * Polls all services for health and aggregates status.
 * Used by orchestrator to monitor service health.
 */

import axios from 'axios';
import type {
  ServiceHealthCheck,
  AggregatedHealthStatus
} from '@factsway/shared-types/config/environment.types';
import { SERVICE_PORTS } from './environment';

/**
 * Check health of a single service
 */
async function checkServiceHealth(
  serviceName: string,
  port: number
): Promise<ServiceHealthCheck> {
  const url = `http://localhost:${port}/health`;
  const startTime = Date.now();
  
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    return {
      service: serviceName,
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      url,
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: serviceName,
      status: 'unhealthy',
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check health of all services
 */
export async function checkAllServices(): Promise<AggregatedHealthStatus> {
  const services = [
    { name: 'records', port: SERVICE_PORTS.records },
    { name: 'ingestion', port: SERVICE_PORTS.ingestion },
    { name: 'export', port: SERVICE_PORTS.export },
    { name: 'caseblock', port: SERVICE_PORTS.caseblock },
    { name: 'signature', port: SERVICE_PORTS.signature },
    { name: 'facts', port: SERVICE_PORTS.facts },
    { name: 'exhibits', port: SERVICE_PORTS.exhibits },
    { name: 'caselaw', port: SERVICE_PORTS.caselaw }
  ];
  
  // Check all services in parallel
  const healthChecks = await Promise.all(
    services.map(s => checkServiceHealth(s.name, s.port))
  );
  
  // Determine overall status
  const healthyCount = healthChecks.filter(h => h.status === 'healthy').length;
  const unhealthyCount = healthChecks.filter(h => h.status === 'unhealthy').length;
  
  let overall: 'healthy' | 'degraded' | 'unhealthy';
  if (healthyCount === services.length) {
    overall = 'healthy';
  } else if (healthyCount > 0) {
    overall = 'degraded';
  } else {
    overall = 'unhealthy';
  }
  
  return {
    overall,
    services: healthChecks,
    timestamp: new Date().toISOString()
  };
}

/**
 * Start health check monitoring
 * 
 * Polls services every 30 seconds and logs status
 */
export function startHealthMonitoring(
  interval: number = 30000,
  onStatusChange?: (status: AggregatedHealthStatus) => void
): NodeJS.Timer {
  let previousStatus: 'healthy' | 'degraded' | 'unhealthy' | null = null;
  
  const timer = setInterval(async () => {
    try {
      const status = await checkAllServices();
      
      // Log status changes
      if (status.overall !== previousStatus) {
        console.log(`[Health Monitor] Status changed: ${previousStatus} → ${status.overall}`);
        
        if (status.overall === 'unhealthy') {
          const unhealthyServices = status.services
            .filter(s => s.status === 'unhealthy')
            .map(s => s.service);
          console.error(`[Health Monitor] Unhealthy services: ${unhealthyServices.join(', ')}`);
        }
        
        previousStatus = status.overall;
        
        if (onStatusChange) {
          onStatusChange(status);
        }
      }
    } catch (error) {
      console.error('[Health Monitor] Health check failed:', error);
    }
  }, interval);
  
  // Run initial check immediately
  checkAllServices().then(status => {
    previousStatus = status.overall;
    if (onStatusChange) {
      onStatusChange(status);
    }
  });
  
  return timer;
}

/**
 * Stop health monitoring
 */
export function stopHealthMonitoring(timer: NodeJS.Timer): void {
  clearInterval(timer);
}
```

---

## Task 5: Cloud Deployment Configuration

### 5.1 Kubernetes Service Definitions

**File:** `infrastructure/kubernetes/services.yaml`

**Action:** CREATE

**Purpose:** Kubernetes Service definitions for service discovery

**Content:**
```yaml
# Kubernetes Services for Service Discovery
#
# Reference: Runbook 0 Section 23.5
#
# Services use Kubernetes DNS for discovery:
# - records-service.factsway.svc.cluster.local:3001
# - ingestion-service.factsway.svc.cluster.local:3002
# etc.

apiVersion: v1
kind: Service
metadata:
  name: records-service
  namespace: factsway
spec:
  selector:
    app: records-service
  ports:
    - protocol: TCP
      port: 3001
      targetPort: 3001
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: ingestion-service
  namespace: factsway
spec:
  selector:
    app: ingestion-service
  ports:
    - protocol: TCP
      port: 3002
      targetPort: 3002
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: export-service
  namespace: factsway
spec:
  selector:
    app: export-service
  ports:
    - protocol: TCP
      port: 3003
      targetPort: 3003
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: caseblock-service
  namespace: factsway
spec:
  selector:
    app: caseblock-service
  ports:
    - protocol: TCP
      port: 3004
      targetPort: 3004
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: signature-service
  namespace: factsway
spec:
  selector:
    app: signature-service
  ports:
    - protocol: TCP
      port: 3005
      targetPort: 3005
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: facts-service
  namespace: factsway
spec:
  selector:
    app: facts-service
  ports:
    - protocol: TCP
      port: 3006
      targetPort: 3006
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: exhibits-service
  namespace: factsway
spec:
  selector:
    app: exhibits-service
  ports:
    - protocol: TCP
      port: 3007
      targetPort: 3007
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: caselaw-service
  namespace: factsway
spec:
  selector:
    app: caselaw-service
  ports:
    - protocol: TCP
      port: 3008
      targetPort: 3008
  type: ClusterIP
```

---

### 5.2 Kubernetes ConfigMap

**File:** `infrastructure/kubernetes/configmap.yaml`

**Action:** CREATE

**Purpose:** Environment variables for cloud deployment

**Content:**
```yaml
# ConfigMap for Cloud Deployment
#
# Reference: Runbook 0 Section 23.5
#
# Services read these environment variables at startup.
# Kubernetes DNS provides service discovery.

apiVersion: v1
kind: ConfigMap
metadata:
  name: factsway-config
  namespace: factsway
data:
  DEPLOYMENT_ENV: "cloud"
  LOG_LEVEL: "info"
  
  # Service URLs (Kubernetes DNS)
  RECORDS_SERVICE_URL: "http://records-service.factsway.svc.cluster.local:3001"
  INGESTION_SERVICE_URL: "http://ingestion-service.factsway.svc.cluster.local:3002"
  EXPORT_SERVICE_URL: "http://export-service.factsway.svc.cluster.local:3003"
  CASEBLOCK_SERVICE_URL: "http://caseblock-service.factsway.svc.cluster.local:3004"
  SIGNATURE_SERVICE_URL: "http://signature-service.factsway.svc.cluster.local:3005"
  FACTS_SERVICE_URL: "http://facts-service.factsway.svc.cluster.local:3006"
  EXHIBITS_SERVICE_URL: "http://exhibits-service.factsway.svc.cluster.local:3007"
  CASELAW_SERVICE_URL: "http://caselaw-service.factsway.svc.cluster.local:3008"
  
  # Cloud provider (set during deployment)
  # CLOUD_PROVIDER: "aws" | "gcp" | "azure"
  
  # Kubernetes namespace
  K8S_NAMESPACE: "factsway"

---
# Secret for PostgreSQL credentials
# (This would be created separately with actual credentials)
apiVersion: v1
kind: Secret
metadata:
  name: postgres-credentials
  namespace: factsway
type: Opaque
stringData:
  POSTGRES_HOST: "postgres.factsway.svc.cluster.local"
  POSTGRES_PORT: "5432"
  POSTGRES_DB: "factsway"
  POSTGRES_USER: "factsway_user"
  POSTGRES_PASSWORD: "CHANGE_ME_IN_PRODUCTION"
```

---

## Task 6: Enterprise Deployment Template

### 6.1 Enterprise .env Template

**File:** `infrastructure/enterprise/.env.template`

**Action:** CREATE

**Purpose:** Template for enterprise on-premise deployment

**Content:**
```bash
# FACTSWAY Enterprise Deployment Configuration
#
# Reference: Runbook 0 Section 22.4
#
# Copy this file to .env and configure for your environment.

# ============================================================================
# DEPLOYMENT CONFIGURATION
# ============================================================================

DEPLOYMENT_ENV=enterprise
LOG_LEVEL=info

# ============================================================================
# SERVICE URLS
# ============================================================================
# 
# For on-premise deployment, these should point to your internal network
# addresses where services are deployed.
#
# If using a reverse proxy, you can use path-based routing:
# - https://factsway.yourcompany.com/api/records
# - https://factsway.yourcompany.com/api/ingestion
# etc.

RECORDS_SERVICE_URL=http://internal-server-1:3001
INGESTION_SERVICE_URL=http://internal-server-2:3002
EXPORT_SERVICE_URL=http://internal-server-3:3003
CASEBLOCK_SERVICE_URL=http://internal-server-4:3004
SIGNATURE_SERVICE_URL=http://internal-server-5:3005
FACTS_SERVICE_URL=http://internal-server-6:3006
EXHIBITS_SERVICE_URL=http://internal-server-7:3007
CASELAW_SERVICE_URL=http://internal-server-8:3008

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

POSTGRES_HOST=your-postgres-host
POSTGRES_PORT=5432
POSTGRES_DB=factsway
POSTGRES_USER=factsway_user
POSTGRES_PASSWORD=CHANGE_ME

# ============================================================================
# OPTIONAL: REVERSE PROXY / TLS
# ============================================================================

# Base URL if services are behind a reverse proxy
# BASE_URL=https://factsway.yourcompany.com

# TLS/SSL configuration (if terminating TLS at service level)
# TLS_ENABLED=true
# TLS_CERT_PATH=/path/to/cert.pem
# TLS_KEY_PATH=/path/to/key.pem

# ============================================================================
# SERVICE-SPECIFIC PORTS (for individual service deployments)
# ============================================================================

# Records Service
# PORT=3001
# SERVICE_NAME=records

# Uncomment and set PORT/SERVICE_NAME when deploying individual services
```

---

### 6.2 Enterprise Docker Compose

**File:** `infrastructure/enterprise/docker-compose.yml`

**Action:** CREATE

**Purpose:** Docker Compose for enterprise deployment

**Content:**
```yaml
# Enterprise Docker Compose
#
# Reference: Runbook 0 Section 22.4
#
# For on-premise deployment using Docker Compose.
# Load environment from .env file.

version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - factsway
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Records Service
  records-service:
    image: factsway/records-service:latest
    env_file: .env
    environment:
      PORT: 3001
      SERVICE_NAME: records
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - factsway
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Ingestion Service
  ingestion-service:
    image: factsway/ingestion-service:latest
    env_file: .env
    environment:
      PORT: 3002
      SERVICE_NAME: ingestion
    depends_on:
      - records-service
    networks:
      - factsway
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Export Service
  export-service:
    image: factsway/export-service:latest
    env_file: .env
    environment:
      PORT: 3003
      SERVICE_NAME: export
    depends_on:
      - records-service
    networks:
      - factsway
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3003/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # CaseBlock Service
  caseblock-service:
    image: factsway/caseblock-service:latest
    env_file: .env
    environment:
      PORT: 3004
      SERVICE_NAME: caseblock
    depends_on:
      - records-service
    networks:
      - factsway
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3004/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Signature Service
  signature-service:
    image: factsway/signature-service:latest
    env_file: .env
    environment:
      PORT: 3005
      SERVICE_NAME: signature
    depends_on:
      - records-service
    networks:
      - factsway
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3005/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Facts Service
  facts-service:
    image: factsway/facts-service:latest
    env_file: .env
    environment:
      PORT: 3006
      SERVICE_NAME: facts
    depends_on:
      - records-service
    networks:
      - factsway
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3006/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Exhibits Service
  exhibits-service:
    image: factsway/exhibits-service:latest
    env_file: .env
    environment:
      PORT: 3007
      SERVICE_NAME: exhibits
    depends_on:
      - records-service
    networks:
      - factsway
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3007/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Caselaw Service
  caselaw-service:
    image: factsway/caselaw-service:latest
    env_file: .env
    environment:
      PORT: 3008
      SERVICE_NAME: caselaw
    depends_on:
      - records-service
    networks:
      - factsway
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3008/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  factsway:
    driver: bridge

volumes:
  postgres_data:
```

---

## Verification

**From Runbook 0 Section 19.9:**

### Verification Checklist

**Configuration Loading:**
- [ ] Python `config_loader.py` loads environment correctly
- [ ] TypeScript `loader.ts` loads environment correctly
- [ ] Validation catches missing required variables
- [ ] Validation catches invalid URL formats
- [ ] Validation catches invalid port numbers

**Desktop Environment Injection:**
- [ ] `generateServiceEnvironment()` produces valid env object
- [ ] All 8 service URLs use localhost
- [ ] Ports match SERVICE_PORTS constants (3001-3008)
- [ ] USER_DATA_DIR points to correct Electron path
- [ ] SQLITE_PATH constructed correctly

**Health Checks:**
- [ ] `checkServiceHealth()` returns status for single service
- [ ] `checkAllServices()` aggregates all services
- [ ] Overall status is 'healthy' when all services healthy
- [ ] Overall status is 'degraded' when some services unhealthy
- [ ] Overall status is 'unhealthy' when all services down
- [ ] Health monitoring interval works
- [ ] Status change callbacks fire correctly

**Kubernetes Configuration:**
- [ ] All 8 services have Service definitions
- [ ] Service DNS names follow pattern: `{service}-service.factsway.svc.cluster.local`
- [ ] ConfigMap contains all required environment variables
- [ ] Service URLs use Kubernetes DNS
- [ ] Secret contains PostgreSQL credentials

**Enterprise Configuration:**
- [ ] `.env.template` contains all required variables
- [ ] Docker Compose defines all 8 services
- [ ] Services depend on PostgreSQL
- [ ] Health checks configured for all services
- [ ] Network isolation via Docker network

**Cross-Deployment Testing:**
- [ ] Same service code runs on Desktop with env injection
- [ ] Same service code runs in Kubernetes with ConfigMap
- [ ] Same service code runs in Docker Compose with .env
- [ ] No hardcoded URLs in service code
- [ ] Service-to-service calls use environment URLs

---

## Success Criteria

✅ Configuration loaders implemented for Python and TypeScript
✅ Validation catches all configuration errors
✅ Desktop orchestrator injects environment correctly
✅ Health check aggregation working
✅ Kubernetes manifests complete
✅ Enterprise Docker Compose working
✅ All 8 services start successfully in each deployment
✅ Service-to-service communication works via configured URLs
✅ No hardcoded localhost URLs in service code

---

## Next Steps

After Runbook 9 completes:

1. **Runbook 10:** Desktop Packaging
   - electron-builder configuration
   - Bundle Python services as executables (PyInstaller)
   - Bundle Node service
   - Platform-specific installers (Windows .exe, macOS .dmg, Linux .AppImage)
   - Auto-update configuration

2. **Runbook 11-15:** Testing, documentation, deployment automation

---

## Reference

**Runbook 0 Sections:**
- Section 23: Service Discovery & Configuration (complete)
- Section 22.2: Desktop Deployment
- Section 22.3: Cloud Deployment
- Section 22.4: Enterprise Deployment

**Dependencies:**
- Runbook 1: Shared types package
- Runbook 7: Desktop orchestrator
- Runbooks 3-6: Backend services

---

**End of Runbook 9**
