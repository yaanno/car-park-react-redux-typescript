
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { park, remove, selectCount, getAllSlots } from './parkingSlice';
import { Heading, Container, Button, SimpleGrid, GridItem, Tooltip, Divider, Center } from '@chakra-ui/react'

const uniqueId = () => {
	const dateString = Date.now().toString(36);
	const randomness = Math.random().toString(36).substr(2);
	return dateString + randomness;
};

// @ts-ignore
const ParkingSlotItem = ({ slot, removeCar }) => {
	return <GridItem>
		<Tooltip label={slot.carId} fontSize='md'>
			<Button onClick={removeCar}>Remove Car</Button>
		</Tooltip>
	</GridItem>
}

// @ts-ignore
const PlaceholderSlotItem = ({ addCar }) => {
	return <GridItem>
		<Tooltip label={'Park here!'} fontSize='md'>
			<Button onClick={addCar} colorScheme='green'>Empty Slot</Button>
		</Tooltip>
	</GridItem>
}

const Parking = () => {
	const dispatch = useAppDispatch();
	const count = useAppSelector(selectCount);
	const allSlots = useAppSelector(getAllSlots);
	const canPark = count > 0;
	return (
		<Container>
			<Heading>Free slots: {count}</Heading>
			<Center height={30}>
				<Divider />
			</Center>
			<SimpleGrid columns={2} spacing={2}>
				{allSlots.map((slot, index) => {
					if (slot.occupied) {
						return <ParkingSlotItem key={`${index}-${slot.carId}`} slot={slot} removeCar={() => {
							dispatch(remove({ carId: slot.carId || '' }))
						}} />;
					} else {
						return <PlaceholderSlotItem addCar={() => {
							dispatch(park({ carId: uniqueId(), slotIndex: index }))
						}} key={`${index}-placeholder`} />;
					}
				})}

			</SimpleGrid>
			<Center height={30}>
				<Divider />
			</Center>
			<Button disabled={!canPark} onClick={() => dispatch(park({ carId: uniqueId() }))}>Park automatically</Button>
		</Container>
	);
}

export default Parking
