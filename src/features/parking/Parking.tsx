
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { park, remove, selectCount, getAllSlots, updatePrice, getCheapestSlot } from './parkingSlice';
import { uniqueId } from '../../util';
import { CircularProgress, Container, Button, SimpleGrid, GridItem, Tooltip, Center, Spinner, Avatar, AvatarGroup, Box } from '@chakra-ui/react'
import Tommy from '../../tommy.jpg';
import Sonny from '../../sonny.jpg';
import { useState } from 'react';

const CURR = '$';

interface Valet {
	name: string
	nick: string
	isVIP: boolean
}

const ParkingSlotItem = ({ carId, removeCar }: {
	carId: string,
	removeCar: () => void
}) => {
	return <GridItem>
		<Tooltip label={carId} fontSize='md'>
			<Center>
				<Button onClick={removeCar} variant='ghost' colorScheme='pink'>
					<Spinner size='sm' speed='1s' /> Remove
				</Button>
			</Center>
		</Tooltip>
	</GridItem>
}

const PlaceholderParkingSlotItem = ({ price, addCar }: {
	price: number,
	addCar: () => void
}) => {
	return <GridItem>
		<Tooltip label={'Park here!'} fontSize='md'>
			<Center>
				<Button variant='solid' onClick={addCar} colorScheme='pink'>Empty: {CURR}{price}</Button>
			</Center>
		</Tooltip>
	</GridItem>
}

const ValetComponent = ({ valet, isBusy }: {
	valet: Valet,
	isBusy: boolean
}) => {
	const avatarSrc = valet.nick === 'Tommy' ? Tommy : Sonny;
	return (<Tooltip label={'Park with ' + valet.nick} fontSize='md'>
		<Box position={'relative'} className='avatarBlock'>
			<CircularProgress className={isBusy ? 'busyStatus' : 'busyStatus hidden'} color={'pink.400'} isIndeterminate size='120px' thickness='4px' />
			<Avatar left='12px' top='12px' position={'absolute'} size='xl' name={valet.name} src={avatarSrc} />
			<Center>{valet.nick}</Center>
		</Box>
	</Tooltip>);
}

const Parking = () => {
	const dispatch = useAppDispatch();
	const count = useAppSelector(selectCount);
	const allSlots = useAppSelector(getAllSlots);
	const canPark = count > 0;
	const cheapestSlot = useAppSelector(getCheapestSlot);

	const valets: Valet[] = [
		{
			name: 'Tommy Vercetti',
			nick: 'Tommy',
			isVIP: false,
		}, {
			name: 'Sonny Forelli',
			nick: 'Sonny',
			isVIP: true
		}
	]
	const [busy, setBusy] = useState(['']);

	return (
		<>
			<Center className='welcome'>Welcome back to the Veneto Hotel</Center>
			<Container>
				{/* <Heading>Free slots: {count}</Heading> */}
				<AvatarGroup spacing={1} justifyContent='center'>
					{valets.map(valet => <ValetComponent key={valet.name} valet={valet} isBusy={busy.includes(valet.nick)} />)}
				</AvatarGroup>

				<SimpleGrid className='parkingArea' columns={2} spacing={5} background='whiteAlpha.600' padding='1rem'>
					{allSlots.map((slot, index) => {
						if (slot.occupied) {
							const { carId } = slot;
							return <ParkingSlotItem key={`${index}-${carId}`} carId={carId} removeCar={() => {
								dispatch(remove({ carId }))
							}} />;
						} else {
							return <PlaceholderParkingSlotItem price={slot.price || 0}
								addCar={() => {
									const carId = uniqueId()
									dispatch(park({ carId, slotIndex: index }));
								}} key={`${index}-placeholder`} />;
						}
					})}
				</SimpleGrid>

				<SimpleGrid columns={3} spacing={1}>
					<GridItem>
						<Button disabled={!canPark} onClick={() => {
							const carId = uniqueId();
							dispatch(park({ carId }));
							setBusy(['Sonny']);
							setTimeout(() => setBusy(['']), 5000);
						}}>Park automatically</Button>
					</GridItem>
					<GridItem>
						<Button disabled={!canPark} onClick={() => {
							const carId = uniqueId();
							const price = cheapestSlot?.price;
							dispatch(park({ carId, price }));
							setBusy(['Tommy']);
							setTimeout(() => setBusy(['']), 5000);
						}}>
							{'Park cheap: ' + CURR + cheapestSlot?.price}
						</Button>
					</GridItem>
					<GridItem>
						<Button onClick={() => dispatch(updatePrice())}>Randomize Prices</Button>
					</GridItem>
				</SimpleGrid>
			</Container>
		</>
	);
}

export default Parking;
