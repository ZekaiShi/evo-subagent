import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createApply } from '../plugin.js'

test('installing the plugin registers all packaged skills with the DSH skill service', async () => {
  const bindingsDir = await mkdtemp(join(tmpdir(), 'evo-subagent-skills-'))
  const registered = []
  const ctx = {
    inject(services, callback) {
      if (services.length === 1 && services[0] === 'skills') {
        callback({ skills: { register(skill) { registered.push(skill) } } })
      }
    },
    tools: { register() {} },
  }

  createApply(value => value)(ctx, { bindingsDir, evolution: false })

  assert.deepEqual(registered.map(skill => skill.name), [
    'evo-route-doctor', 'evo-memory-review', 'evo-delegation-guide',
  ])
  for (const skill of registered) {
    assert.equal(skill.source, 'bundled')
    assert.equal(skill.resourceBase.kind, 'directory')
    assert.ok(skill.content.length > 100)
    assert.ok(skill.description.length > 20)
    assert.ok(skill.path.endsWith(`${skill.name}\\SKILL.md`) || skill.path.endsWith(`${skill.name}/SKILL.md`))
  }
})
