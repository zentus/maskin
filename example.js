const Maskin = require('./')

const options = {
	// Set initial state
  initialState: {
		catName: 'Garfield'
	},

	// Define your own methods
	logCatName: () => console.log(`The cat is called ${machine.state.catName}`),
	setCatName: catName => machine.setState({catName}),

	// Hooks (Call setState inside these methods at your own risk)
	// Use shouldUpdate to prevent state updates. Default: () => true
	shouldUpdate: (state, nextState) => false,
	// Use beforeUpdate to run code before a state update happens. Default: () => {}
	beforeUpdate: (state, nextState) => {},
	// Use afterUpdate to run code after a state update happened. Default: () => {}
  afterUpdate: (state, previousState) => {},
	// Use updatePrevented after a state update was prevented by shouldUpdate. Default: () => {}
  updatePrevented: (state, preventedUpdate) => {}
}

const machine = new Maskin(options)

// machine.state is immutable
machine.state = null

console.log(machine.state)
//=> {catName: 'Garfield'}

machine.logCatName()
// => The cat is called Garfield

// Using your own method
machine.setCatName('Nisse')

machine.logCatName()
//=> The cat is called Nisse

// Using setState directly
machine.setState({catName: 'Carlos'})

machine.logCatName()
//=> The cat is called Carlos

// Use resetState() to reset state to initial state
machine.resetState()

console.log(machine.state)
//=> {catName: 'Garfield'}

// These properties are immutable as well
machine.updateCount = 3000

console.log(machine.updateCount)
//=> 2

console.log(machine.preventedUpdateCount)
//=> 0

console.log(machine.resetStateCount)
//=> 1
machine.__internal__ = null
console.log(machine.__internal__)
