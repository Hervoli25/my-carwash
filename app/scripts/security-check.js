#!/usr/bin/env node

/**
 * Security Validation Script for Car Wash Application
 * Run this script before deployment to check for common security issues
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let issuesFound = 0;
let warningsFound = 0;

function log(message, color = RESET) {
  console.log(color + message + RESET);
}

function error(message) {
  log(`❌ ERROR: ${message}`, RED);
  issuesFound++;
}

function warning(message) {
  log(`⚠️ WARNING: ${message}`, YELLOW);
  warningsFound++;
}

function success(message) {
  log(`✅ PASS: ${message}`, GREEN);
}

function info(message) {
  log(`ℹ️ INFO: ${message}`, BLUE);
}

function checkEnvironmentFiles() {
  info('Checking environment file security...');
  
  // Check if .env.production exists (should not be committed)
  if (fs.existsSync('.env.production')) {
    error('.env.production file found - this should never be committed to version control!');
  } else {
    success('.env.production not found in repository');
  }
  
  // Check if .env.production.template exists
  if (fs.existsSync('.env.production.template')) {
    success('.env.production.template template found');
    
    // Check if template contains placeholder values
    const templateContent = fs.readFileSync('.env.production.template', 'utf8');
    if (templateContent.includes('REPLACE_WITH_')) {
      success('Template contains proper placeholders');
    } else {
      warning('Template may contain actual credentials');
    }
  } else {
    warning('.env.production.template not found - consider creating one for deployment guidance');
  }
  
  // Check .env.example
  if (fs.existsSync('.env.example')) {
    const exampleContent = fs.readFileSync('.env.example', 'utf8');
    if (exampleContent.includes('your-') || exampleContent.includes('REPLACE_')) {
      success('.env.example contains placeholders');
    } else {
      warning('.env.example may contain actual credentials');
    }
  }
}

function checkHardcodedSecrets() {
  info('Scanning for hardcoded secrets...');
  
  const filesToCheck = [
    'scripts/create-admin.js',
    'lib/api-auth.ts',
    'scripts/seed.ts',
  ];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for hardcoded passwords
      if (content.includes("'") && content.match(/'[A-Za-z0-9@#$%^&*!]+'/g)) {
        const hardcodedStrings = content.match(/'[A-Za-z0-9@#$%^&*!]{8,}'/g);
        if (hardcodedStrings) {
          // Filter out likely variable names and common strings
          const suspiciousStrings = hardcodedStrings.filter(str => 
            !str.includes('process.env') && 
            !str.includes('ADMIN') && 
            !str.includes('USER') &&
            str.length > 10
          );
          
          if (suspiciousStrings.length > 0) {
            warning(`Possible hardcoded secrets in ${filePath}: ${suspiciousStrings.join(', ')}`);
          }
        }
      }
      
      // Check for environment variable usage
      if (content.includes('process.env.')) {
        success(`${filePath} uses environment variables`);
      } else {
        warning(`${filePath} may not be using environment variables for secrets`);
      }
    }
  });
}

function checkDefaultCredentials() {
  info('Checking for default credentials in documentation...');
  
  const docsToCheck = [
    'ADMIN_ACCESS_GUIDE.md',
    'README.md',
    'SETUP_GUIDE.md',
    'SETUP-INSTRUCTIONS.md'
  ];
  
  docsToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for common default passwords
      const defaultPasswords = ['password123', 'admin123', 'carwash2024', 'johndoe123'];
      let foundDefaults = false;
      
      defaultPasswords.forEach(defaultPass => {
        if (content.includes(defaultPass)) {
          if (!content.includes('NEVER') && !content.includes('change') && !content.includes('secure')) {
            error(`Default password "${defaultPass}" found in ${filePath} without security warning`);
            foundDefaults = true;
          }
        }
      });
      
      if (!foundDefaults) {
        success(`${filePath} appears to have secure credential documentation`);
      }
    }
  });
}

function checkGitignore() {
  info('Checking .gitignore configuration...');
  
  if (fs.existsSync('.gitignore')) {
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    
    const requiredIgnores = ['.env', '.env.production', '.env.local'];
    let allPresent = true;
    
    requiredIgnores.forEach(ignore => {
      if (gitignoreContent.includes(ignore)) {
        success(`${ignore} is properly ignored`);
      } else {
        error(`${ignore} is NOT in .gitignore - this is a security risk!`);
        allPresent = false;
      }
    });
    
    if (allPresent) {
      success('All critical environment files are properly ignored');
    }
  } else {
    error('.gitignore file not found');
  }
}

function checkSecurityDocumentation() {
  info('Checking security documentation...');
  
  if (fs.existsSync('SECURITY_GUIDE.md')) {
    success('SECURITY_GUIDE.md found - good security documentation practice');
  } else {
    warning('Consider creating SECURITY_GUIDE.md for security best practices');
  }
  
  // Check if documentation mentions security practices
  const docsWithSecurity = ['README.md', 'SETUP_GUIDE.md'].filter(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8').toLowerCase();
      return content.includes('security') || content.includes('password') || content.includes('credential');
    }
    return false;
  });
  
  if (docsWithSecurity.length > 0) {
    success(`Security practices mentioned in: ${docsWithSecurity.join(', ')}`);
  } else {
    warning('Consider adding security best practices to documentation');
  }
}

function main() {
  log('🔒 Running Security Validation for Car Wash Application', BLUE);
  log('=' .repeat(60), BLUE);
  
  checkEnvironmentFiles();
  checkHardcodedSecrets();
  checkDefaultCredentials();
  checkGitignore();
  checkSecurityDocumentation();
  
  log('\n' + '=' .repeat(60), BLUE);
  log('📊 Security Validation Summary', BLUE);
  
  if (issuesFound === 0 && warningsFound === 0) {
    log('🎉 All security checks passed!', GREEN);
  } else {
    if (issuesFound > 0) {
      log(`❌ ${issuesFound} critical security issues found`, RED);
    }
    if (warningsFound > 0) {
      log(`⚠️ ${warningsFound} security warnings found`, YELLOW);
    }
    
    log('\nPlease address the issues above before deploying to production!', YELLOW);
  }
  
  process.exit(issuesFound > 0 ? 1 : 0);
}

main();