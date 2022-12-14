import parkingReducer, {
	ParkingState,
	park,
	remove,
	generateEmptySlots
} from './parkingSlice';

const EMPTY_SLOTS = 20;

describe('parking reducer', () => {
	const initialState: ParkingState = {
		slots: generateEmptySlots(EMPTY_SLOTS),
		freeSlots: EMPTY_SLOTS
	};

	it('should handle initial state', () => {
		expect(parkingReducer(undefined, { type: 'unknown' }).freeSlots).toEqual(EMPTY_SLOTS);
	});

	it('should handle park', () => {
		const actual = parkingReducer(initialState, park({ carId: 'abc' }));
		expect(actual.freeSlots).toEqual(EMPTY_SLOTS - 1);
		expect(actual.slots[0]).toEqual({carId: 'abc', occupied: true, price: actual.slots[0].price});
	});

	it('should handle park with spec slot index', () => {
		const actual = parkingReducer(initialState, park({ carId: 'abc', slotIndex: 2 }));
		expect(actual.freeSlots).toEqual(EMPTY_SLOTS - 1);
		expect(actual.slots[2]).toEqual({carId: 'abc', occupied: true, price: actual.slots[2].price});
	});

	it('should handle remove', () => {
		const actual = parkingReducer(initialState, remove({ carId: 'abc' }));
		expect(actual.freeSlots).toEqual(EMPTY_SLOTS);
	});

});
