
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { park, remove, selectCount, getAllSlots, updatePrice, getCheapestSlot } from './parkingSlice';
import { uniqueId } from '../../util';
import { Switch, CircularProgress, Container, Button, SimpleGrid, GridItem, Tooltip, Center, Spinner, Avatar, AvatarGroup, Box, Heading } from '@chakra-ui/react'
import Tommy from '../../tommy.jpg';
import Sonny from '../../sonny.jpg';
import { useState } from 'react';
import audiofile from '../../sound/gta.mp3';
import TommyEasy from '../../sound/tommy-easy.mp3';

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
					Remove
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

const ValetComponent = ({ valet, isBusy, handleValetClick }: {
	valet: Valet,
	isBusy: boolean
	handleValetClick: () => void
}) => {
	const avatarSrc = valet.nick === 'Tommy' ? Tommy : Sonny;
	const tooltip = isBusy ? valet.nick + ' is busy right now': 'Park with ' + valet.nick;
	const clickHandler = isBusy ? () => {} : handleValetClick;
	return (<Tooltip label={tooltip} fontSize='md'>
		<Box position={'relative'} className='avatarBlock' onClick={clickHandler}>
			<CircularProgress className={isBusy ? 'busyStatus' : 'busyStatus hidden'} color={'pink.400'} isIndeterminate size='120px' thickness='4px' />
			<Avatar left='12px' top='12px' position={'absolute'} size='xl' name={valet.name} src={avatarSrc} />
			<Center>{valet.nick}</Center>
		</Box>
	</Tooltip>);
}

const AudioPlayer = () => {
	const [canplay, setCanPlay] = useState(false);
	const [isPlaying, setPlaying] = useState(false);

	const handlePlay = () => {
		const player = document.getElementById('audioPlayer');
		if (!player) {
			return;
		}
		// @ts-ignore
		player.volume = 0.5;
		if (canplay && !isPlaying) {
			// @ts-ignore
			player.play();
		} else {
			// @ts-ignore
			player.pause();
			setPlaying(false);
		}
	}

	return (
		<>
			<Switch colorScheme='pink' disabled={!canplay} size='lg' onChange={() => handlePlay()} />
			<audio id='audioPlayer' src={audiofile} onPlaying={() => setPlaying(true)} onCanPlay={() => setCanPlay(true)} />
		</>
	)
}

const VoicePlayer = ({
	voice,
	play
}:{
	voice: string, play: boolean
}) => {
	// TODO: different voice for Sonny :)
	const source = voice === 'Tommy' ? TommyEasy : TommyEasy;
	const player = document.getElementById('voicePlayer');
	let played = false;
	if (voice && play && !played) {
		// @ts-ignore
		player.play();
		played = true;
	}
	return <audio id='voicePlayer' src={source} />
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
	const [voice, setVoice] = useState('')
	const [voicePlayState, setPlayState] = useState(false)

	const handleValetClick = ({ valet, price }: {
		valet: string,
		price?: number
	}) => {
		const carId = uniqueId();
		dispatch(park({ carId, price }));
		setBusy(() => {
			let busyValets = [...busy];
			if (!busyValets.includes(valet)) {
				busyValets.push(valet);
			}
			return busyValets;
		})
		setVoice(valet);
		setPlayState(true);
		setTimeout(() => setPlayState(false), 1000);
		setTimeout(() => setBusy(() => {
			const busyValets = [...busy];
			return busyValets.filter(busyValet => busyValet !== valet);
		}), 5000);
	}

	return (
		<>
			<Center className='welcome'>Welcome back to the Veneto Hotel</Center>
			<Container>
				<AvatarGroup spacing={1} justifyContent='center'>
					{valets.map(valet => <ValetComponent
						handleValetClick={() => handleValetClick({
							valet: valet.nick,
							price: !valet.isVIP ? cheapestSlot?.price : undefined
						})}
						key={valet.name}
						valet={valet}
						isBusy={busy.includes(valet.nick)} />)}
				</AvatarGroup>

				<Center>
					<p className='welcome'>Play theme music</p>
					<AudioPlayer />
				</Center>

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
						<Button disabled={!canPark} onClick={() => handleValetClick({
							valet: 'Sonny'
						})}>Park automatically</Button>
					</GridItem>
					<GridItem>
						<Button disabled={!canPark} onClick={() => handleValetClick({
							price: cheapestSlot?.price,
							valet: 'Tommy'
						})}>
							{'Park cheap: ' + CURR + cheapestSlot?.price}
						</Button>
					</GridItem>
					<GridItem>
						<Button onClick={() => dispatch(updatePrice())}>Randomize Prices</Button>
					</GridItem>
				</SimpleGrid>
				<VoicePlayer voice={voice} play={voicePlayState} />
			</Container>
		</>
	);
}

export default Parking;
