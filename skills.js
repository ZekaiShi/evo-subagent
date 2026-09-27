import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const BUNDLED_SKILL_NAMES = Object.freeze([
  'evo-route-doctor',
  'evo-memory-review',
  'evo-delegation-guide',
])

const skillsDir = fileURLToPath(new URL('./skills/', import.meta.url))

export function loadBundledSkill(name) {
  if (!BUNDLED_SKILL_NAMES.includes(name)) throw new Error(`unknown bundled skill: ${name}`)
  const path = join(skillsDir, name, 'SKILL.md')
  const text = readFileSync(path, 'utf8')
  const match = /^---\r?\nname: ([a-z0-9]+(?:-[a-z0-9]+)*)\r?\ndescription: ([^\r\n]+)\r?\n---\r?\n([\s\S]+)$/.exec(text)
  if (match === null || match[1] !== name) throw new Error(`invalid bundled skill: ${path}`)
  return {
    name,
    description: match[2],
    content: match[3].trim(),
    source: 'bundled',
    path,
    resourceBase: { kind: 'directory', path: dirname(path) },
  }
}

export function registerBundledSkills(skills) {
  for (const name of BUNDLED_SKILL_NAMES) skills.register(loadBundledSkill(name))
}
