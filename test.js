const test = require('ava')
const { merge } = require('immutable')
const Maskin = require('./dist')

const fixture = {
	a: {
		hello: 1
	},
	b: {
		other: 2
	}
}

const { a, b } = fixture

test('default initial state', t => {
	const machine = new Maskin
  t.deepEqual(machine.state, {})
})

test('setState using an object', t => {
	const machine = new Maskin

	machine.setState(a)
  t.deepEqual(machine.state, a)
	machine.setState(b)
	t.deepEqual(machine.state, {
		...a,
		...b
	})
})

test('setState using a function', t => {
	const machine = new Maskin
	machine.setState(state => a)
  t.deepEqual(machine.state, a)

	machine.setState(state => b)
	t.deepEqual(machine.state, {
		...a,
		...b
	})
})

test('resetState', t => {
	const machine = new Maskin({
		initialState: a
	})
	t.deepEqual(machine.state, a)

	machine.setState(state => b)
	t.deepEqual(machine.state, {
		...a,
		...b
	})

	machine.resetState()
	t.deepEqual(machine.state, a)
})

test('state and __internal__ are immutable', t => {
	const machine = new Maskin({
		initialState: a
	})

	const internal = merge(machine.__internal__)
	machine.state = null
	machine.__internal__ = null

	t.deepEqual(machine.state, a)
	t.deepEqual(machine.__internal__, internal)
})

test('beforeUpdate', t => {
	const machine = new Maskin({
		initialState: a,
		beforeUpdate: (state, nextState) => {
			t.deepEqual(state, a)
			t.deepEqual(nextState, {
				...a,
				...b
			})
		},
	})

	machine.setState(b)
})

test('afterUpdate', t => {
	const machine = new Maskin({
		initialState: a,
		afterUpdate: (state, previousState) => {
			t.deepEqual(previousState, a)
			t.deepEqual(state, {
				...a,
				...b
			})
		},
	})

	machine.setState(b)
})

test('shouldUpdate', t => {
	const machine = new Maskin({
		initialState: a,
		shouldUpdate: state => state.hello === 1,
	})

	t.is(machine.updateCount, 0)
	t.is(machine.state.hello, 1)

	machine.setState({hello: null})
	t.is(machine.updateCount, 1)
	t.is(machine.preventedUpdateCount, 0)

	machine.setState(b)
	t.is(machine.updateCount, 1)
	t.is(machine.preventedUpdateCount, 1)
})

test('updatePrevented', t => {
	const machine = new Maskin({
		initialState: a,
		shouldUpdate: state => false,
		updatePrevented: (state, preventedUpdate) => {
			t.deepEqual(state, a)
			t.deepEqual(preventedUpdate, b)
		}
	})

	machine.setState(b)
	t.is(machine.preventedUpdateCount, 1)
})

test('updateCount', t => {
	const machine = new Maskin
	t.is(machine.updateCount, 0)

	machine.setState(state => a)
  t.is(machine.updateCount, 1)

	machine.setState(state => b)
	t.is(machine.updateCount, 2)

	machine.updateCount = 0
	t.is(machine.updateCount, 2)
})

test('preventedUpdateCount', t => {
	const machine = new Maskin({
		shouldUpdate: () => false
	})
	t.is(machine.preventedUpdateCount, 0)

	machine.setState(state => a)
  t.is(machine.preventedUpdateCount, 1)

	machine.setState(state => b)
	t.is(machine.preventedUpdateCount, 2)

	machine.preventedUpdateCount = 0
	t.is(machine.preventedUpdateCount, 2)
})

test('resetStateCount', t => {
	const machine = new Maskin
	t.is(machine.resetStateCount, 0)

	machine.resetState()
	t.is(machine.resetStateCount, 1)

	machine.resetState()
	t.is(machine.resetStateCount, 2)

	machine.resetStateCount = 0
	t.is(machine.resetStateCount, 2)
})
