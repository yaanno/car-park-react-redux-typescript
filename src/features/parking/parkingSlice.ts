import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface Slot {
	occupied: boolean,
	price?: number,
	carId?: string
}

export interface Car {
	carId: string
}

interface Payload {
	carId: string
	slotIndex?: number
}

export interface ParkingState {
  slots: Slot[],
  freeSlots: number
}

const EMPTY_SLOTS = 20;

export const generateEmptySlots = (slots: number = EMPTY_SLOTS): Slot[] => {
	return new Array(slots).fill({
		occupied: false
	})
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
    }
  },
});
export const selectCount = (state: RootState) => state.parkingSlot.freeSlots;
export const getAllSlots = (state: RootState) => state.parkingSlot.slots;
export const getOccupiedSlots = (state: RootState) => {
	return state.parkingSlot.slots.filter(slots => slots.occupied);
};

export const { park, remove } = parkingSlice.actions;
export default parkingSlice.reducer;
