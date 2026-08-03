import test from 'node:test';
import assert from 'node:assert/strict';
import { GitService } from './gitService';

test('GitService exposes the expected repository operations', () => {
  const service = new GitService();

  assert.equal(typeof service.clone, 'function');
  assert.equal(typeof service.fetch, 'function');
  assert.equal(typeof service.pull, 'function');
  assert.equal(typeof service.push, 'function');
  assert.equal(typeof service.add, 'function');
  assert.equal(typeof service.commit, 'function');
  assert.equal(typeof service.status, 'function');
  assert.equal(typeof service.checkout, 'function');
  assert.equal(typeof service.currentBranch, 'function');
  assert.equal(typeof service.createBranch, 'function');
});
