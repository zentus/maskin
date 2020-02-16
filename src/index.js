const { Map, merge } = require('immutable')

const Util = {
	returnTrue: () => true,
	noop: () => {},
	isNumberOrTruthy: value => typeof value === 'number' || value,
	checkInternals: (self, caller) => {
		const throwError = missingInternals => {
			throw new Error(`StateMachine internals have become corrupted. Are you mutating an internal property? Missing internals: ${JSON.stringify(missingInternals)}`)
		}

		const hasInternalProperty = Boolean(self.__internal__ && self.__internal__.get && self.__internal__.set)

		if (!hasInternalProperty) {
			throwError(['__internal__'])
		}

		const missingInternals = Util.internals
			.filter(internalName => {
				return internalName !== caller && !Util.isNumberOrTruthy(self[internalName])
			})

		if (missingInternals.length > 0 || !self.__internal__.get('state')) {
			throwError(missingInternals)
		}
	},
	internals: [
		'setState',
		'resetState',
		'state',
		'__internal__',
		'updateCount',
		'preventedUpdateCount',
		'resetStateCount'
	],
	readOnlyOptions: {
		writable: false,
		enumerable: false,
		configurable: true
	}
}

class Maskin {
	constructor(Component = {}) {
		Object.entries(Component).forEach(([methodName, method]) => {
			if (!Util.internals.includes(methodName)) {
				this[methodName] = method
			}
		})

		const initialState = Component.initialState || {}

		this.setInternals({
			state: initialState,
			initialState,
			updateCount: 0,
			preventedUpdateCount: 0,
			resetStateCount: 0
		})

	  this.shouldUpdate = Component.shouldUpdate || Util.returnTrue
	  this.beforeUpdate = Component.beforeUpdate || Util.noop
	  this.afterUpdate = Component.afterUpdate || Util.noop
	  this.updatePrevented = Component.updatePrevented || Util.noop

		this.setState = this.setState.bind(this)
		this.resetState = this.resetState.bind(this)
		this.setInternals = this.setInternals.bind(this)

	  if (Component.afterCreated) {
      Component.afterCreated(this)
	  }
	}

	setInternals(props) {
		Object.defineProperty(this, '__internal__', {
		  value: Map({
				...(this.__internal__ && this.__internal__.toObject()),
				...props
			}),
		  ...Util.readOnlyOptions
		})
	}

	get updateCount() {
		return this.__internal__.get('updateCount')
	}

	get preventedUpdateCount() {
		return this.__internal__.get('preventedUpdateCount')
	}

	get resetStateCount() {
		return this.__internal__.get('resetStateCount')
	}

	get state() {
		Util.checkInternals(this, 'state')
		return this.__internal__.get('state')
	}

	resetState() {
		Util.checkInternals(this, 'resetState')
		const initialState = this.__internal__.get('initialState')

		this.setInternals({
			state: initialState,
			resetStateCount: this.resetStateCount + 1
		})

		return initialState
	}

	setState(input) {
		Util.checkInternals(this, 'setState')

		let update

		if (typeof input === 'object') {
			update = {
				...input
			}
		} else if (typeof input === 'function') {
			update = {
				...input(this.state)
			}
		} else {
			return false
		}

		if (update) {
			const prevState = {
				...this.state
			}

			const nextState = {
				...prevState,
				...update
			}

			const shouldUpdate = this.shouldUpdate(this.state, nextState)

			if (shouldUpdate) {
				this.beforeUpdate(this.state, nextState)

				this.setInternals({
					state: nextState,
					updateCount: this.updateCount + 1
				})

				this.afterUpdate(this.state, prevState, this.setState)
			} else {
				this.updatePrevented(this.state, update)

				this.setInternals({
					preventedUpdateCount: this.preventedUpdateCount + 1
				})
			}

			return this.state
		}
	}
}

module.exports = Maskin
