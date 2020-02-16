# maskin
Create a state machine with hooks, immutable state, and a setState method

## Example

```javascript
const Maskin = require('maskin')

const machine = new Maskin({
	// Set initial state
  initialState: {
		catName: 'Garfield'
	},

	// Define your own methods
	logCatName: () => console.log(`The cat is called ${machine.state.catName}`),
	setCatName: catName => machine.setState({catName}),
	appendToCatName: string => machine.setState(state => ({catName: state.catName + string})),

	// Hooks (Call setState inside these methods at your own risk)
	// Use shouldUpdate to prevent state updates. Default: () => true
	shouldUpdate: (state, nextState) => true,
	// Use beforeUpdate to run code before any state update happens. Default: () => {}
	beforeUpdate: (state, nextState) => {},
	// Use afterUpdate to run code after the state was updated. Default: () => {}
  afterUpdate: (state, previousState) => {},
	// Use updatePrevented after a state update was prevented by shouldUpdate. Default: () => {}
  updatePrevented: (state, preventedUpdate) => {},
	// Use afterCreated to run code directly after the Maskin has been created
	afterCreated: machine => {}
})

machine.logCatName()
// => The cat is called Garfield

machine.setCatName('Nisse')

machine.logCatName()
//=> The cat is called Nisse

machine.appendToCatName(' the Great')

machine.logCatName()
//=> The cat is called Nisse the Great

// machine.state is immutable
machine.state = null

machine.setState({catName: 'Carlos', dogName: 'Pluto'})

machine.logCatName()
//=> The cat is called Carlos

console.log(machine.state)
//=> {catName: 'Carlos', dogName: 'Pluto'}
```
