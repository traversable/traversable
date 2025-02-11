import { Chomp } from '@traversable/core'
import * as vi from 'vitest'

vi.describe(`〖⛳️〗‹‹‹ ❲@traversable/core/Chomp❳`, () => {
  vi.it(`〖⛳️〗› ❲Chomp.either❳`, () => {
    const impossible = Chomp.either()
    vi.assert.deepEqual(impossible('' as never), Chomp.fail())

    const aOrB = Chomp.either(Chomp.char('a'), Chomp.char('b'))
    console.log(aOrB('abc'))
    vi.assert.deepEqual(aOrB(''), Chomp.fail())
    vi.assert.deepEqual(aOrB('c'), Chomp.fail())
    vi.assert.deepEqual(aOrB('a'), Chomp.succeed('a'))
    vi.assert.deepEqual(aOrB('b'), Chomp.succeed('b'))
    vi.assert.deepEqual(aOrB('ab'), Chomp.succeed('a', 'b'))
    vi.assert.deepEqual(aOrB('bc'), Chomp.succeed('b', 'c'))
  })

  vi.it(`〖⛳️〗› ❲Chomp.sequence❳`, () => {
    const trivial = Chomp.sequence()
    vi.assert.deepEqual(trivial(''), Chomp.succeed(''))
    vi.assert.deepEqual(trivial('abc'), Chomp.succeed('', 'abc'))

    const ab = Chomp.sequence(Chomp.char('a'), Chomp.char('b'))

    vi.assert.deepEqual(ab(''), Chomp.fail())
    vi.assert.deepEqual(ab('a'), Chomp.fail())
    vi.assert.deepEqual(ab('ab'), Chomp.succeed('ab'))
    vi.assert.deepEqual(ab('abc'), Chomp.succeed('ab', 'c'))
  })
})
