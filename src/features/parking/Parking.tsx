
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { park, remove, selectCount, getAllSlots } from './parkingSlice';
import { Heading, Container, Button, SimpleGrid, GridItem, Tooltip, Divider, Center, Spinner } from '@chakra-ui/react'

const uniqueId = () => {
	return Date.now().toString(36);
};

const ParkingSlotItem = ({ carId, removeCar }: {
	carId: string,
	removeCar: () => void
}) => {
	return <GridItem>
		<Tooltip label={carId} fontSize='md'>
			<Button onClick={removeCar}>
				<Spinner size='sm' speed='1s' /> Remove
			</Button>
		</Tooltip>
	</GridItem>
}

const PlaceholderParkingSlotItem = ({ addCar }: {
	addCar: () => void
}) => {
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
			<Center height={50}>
				<Heading>Free slots: {count}</Heading>
			</Center>
			<Center height={30}>
				<Divider />
			</Center>
			<SimpleGrid columns={4} spacing={2}>
				{allSlots.map((slot, index) => {
					if (slot.occupied) {
						const { carId } = slot;
						return <ParkingSlotItem key={`${index}-${carId}`} carId={carId} removeCar={() => {
							dispatch(remove({ carId }))
						}} />;
					} else {
						return <PlaceholderParkingSlotItem addCar={() => {
							const carId = uniqueId()
							dispatch(park({ carId, slotIndex: index }));
							setTimeout(() => dispatch(remove({ carId })), 10000);
						}} key={`${index}-placeholder`} />;
					}
				})}
			</SimpleGrid>
			<Center height={30}>
				<Divider />
			</Center>
			<Button disabled={!canPark} onClick={() => {
				const carId = uniqueId();
				dispatch(park({ carId }));
				setTimeout(() => dispatch(remove({ carId })), 10000);
			}}>Park automatically</Button>
		</Container>
	);
}

export default Parking;
