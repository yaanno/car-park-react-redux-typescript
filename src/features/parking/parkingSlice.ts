import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface Slot {
	occupied: boolean
	price: number
	carId: string
}

export interface Car {
	carId: string
}

interface Price {
	price: number
}

interface Payload {
	carId: string
	slotIndex?: number
	price?: number
}

export interface ParkingState {
  slots: Slot[]
  freeSlots: number
}

const EMPTY_SLOTS = 20;
const MAX_PRICE = 100;

const generateRandomPrice = () => {
	return Math.floor(Math.random() * MAX_PRICE);
}

export const generateEmptySlots = (slots: number = EMPTY_SLOTS): Slot[] => {
	const price = generateRandomPrice();
	return new Array(slots).fill({
		occupied: false,
		carId: '',
		price
	});
}

const initialState: ParkingState = {
  slots: generateEmptySlots(),
  freeSlots: EMPTY_SLOTS
};

const resetSlot = (slot: Slot) => {
	slot.occupied = false;
	slot.carId = '';
	return slot;
};

export const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    park: (state: ParkingState, action: PayloadAction<Payload>) => {
		let emptySlot;
		if (action.payload.slotIndex) {
			emptySlot = state.slots[action.payload.slotIndex];
		} else if (action.payload.price) {
			emptySlot = state.slots.find(slot => slot.price === action.payload.price && !slot.occupied);
		} else {
			emptySlot = state.slots.find(slot => !slot.occupied);
		}

		if (!emptySlot) {
			return;
		}
		emptySlot.carId = action.payload.carId;
		emptySlot.occupied = true;
		state.freeSlots -= 1;
    },
    remove: (state: ParkingState, action: PayloadAction<Car>) => {
		const occupiedSlot = state.slots.find(slot => slot.carId === action.payload.carId);
		if (!occupiedSlot) {
			return;
		}
		resetSlot(occupiedSlot);
		state.freeSlots += 1;
    },
	updatePrice: (state: ParkingState) => {
		state.slots.map(slot => {
			slot.price = slot.occupied ? slot.price : generateRandomPrice();
			return slot;
		});
	}
  },
});
export const selectCount = (state: RootState) => state.parkingSlot.freeSlots;
export const getAllSlots = (state: RootState) => state.parkingSlot.slots;
export const getOccupiedSlots = (state: RootState) => {
	return state.parkingSlot.slots.filter(slots => slots.occupied);
};
export const getCheapestSlot = (state: RootState) => {
	if (state.parkingSlot.freeSlots === 0) {
		return;
	}
	const slots = [...state.parkingSlot.slots].filter(slot => !slot.occupied);
	slots.sort((a,b) => (a.price > b.price) ? 1 : ((b.price > a.price) ? -1 : 0));
	return state.parkingSlot.slots.find(slot => slot.price === slots[0].price && !slot.occupied);
};

export const { park, remove, updatePrice } = parkingSlice.actions;
export default parkingSlice.reducer;
