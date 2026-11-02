const { describe, it } = require('node:test');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('IntelliFarm Platform Verification Tests', () => {
  it('should verify public/diagrams.html contains all 7 UML architecture diagrams', () => {
    const diagramsHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'diagrams.html'), 'utf8');
    assert(diagramsHtml.includes('1. Entity-Relationship (ER) Diagram'), 'Missing ER Diagram');
    assert(diagramsHtml.includes('2. Database Physical Schema Diagram'), 'Missing Database Schema Diagram');
    assert(diagramsHtml.includes('3. Use Case Diagram'), 'Missing Use Case Diagram');
    assert(diagramsHtml.includes('4. Class Diagram'), 'Missing Class Diagram');
    assert(diagramsHtml.includes('5. Sequence Diagram'), 'Missing Sequence Diagram');
    assert(diagramsHtml.includes('6. Activity Diagram'), 'Missing Activity Diagram');
    assert(diagramsHtml.includes('7. Deployment Diagram'), 'Missing Deployment Diagram');
  });

  it('should verify Prisma database schema defines core entities', () => {
    const schema = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'schema.prisma'), 'utf8');
    assert(schema.includes('model User'), 'Missing User model');
    assert(schema.includes('model Farm'), 'Missing Farm model');
    assert(schema.includes('model Crop'), 'Missing Crop model');
    assert(schema.includes('model DiseaseReport'), 'Missing DiseaseReport model');
  });

  it('should verify critical Next.js app pages and components exist', () => {
    assert(fs.existsSync(path.join(__dirname, '..', 'src', 'app', 'page.tsx')), 'Missing Landing / App page');
    assert(fs.existsSync(path.join(__dirname, '..', 'src', 'components', 'ecocrop', 'app-shell.tsx')), 'Missing App Shell');
    assert(fs.existsSync(path.join(__dirname, '..', 'src', 'app', 'api', 'v1')), 'Missing API routes');
  });
});
