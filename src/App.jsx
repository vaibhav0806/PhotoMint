import './App.css'
import { NextUIProvider } from "@nextui-org/react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Image, Card, CardBody, CardFooter, useDisclosure, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import MetamaskSVG from "./assets/metamask.svg"
import { useState, useEffect } from 'react';
import { GetIpfsUrlFromPinata } from './utils';
import MemoriesABI from './abi/Memories.json'
import { ethers } from "ethers";
import CameraIcon from '@mui/icons-material/Camera';

function App() {

    const list = [
        {
            title: "Orange",
            src: "QmPrWMBgSSmoSouaLgJN8NaMn3814C2pHKMm8Wz32yX8jN",
            price: "1",
        },
        {
            title: "Tangerine",
            src: "QmUgwE3Zi7iLGHcxoTqMzA8DThFquK5c1jLoYFqrv5oZ7a",
            price: "2",
        },
        {
            title: "Raspberry",
            src: "QmPZ9DSzb64Lo2yWAfNqLzog5YFMpuQeXL4vWzchp2rpD8",
            price: "3",
        },
        {
            title: "Lemon",
            src: "QmXLyrQraY9dHNSkuDUYS57Qm93REBccxmtcpH3ba6PQhx",
            price: "4",
        },
        {
            title: "Avocado",
            src: "QmUnhaBg36aJmmgn65VLsBx8Pf6ujAgEjWpyTYvx7qJAK8",
            price: "5",
        },
        {
            title: "Lemon 2",
            src: "QmWzoJE4F8WWH4cH5oTduNtqmTtuAL87YE3Tcc91Q3sdPP",
            price: "6",
        },
        {
            title: "Banana",
            src: "QmTWNEaPYfWo9N5zsVdfypQV6a81G5wuHZECWgYM4E1oyr",
            price: "7",
        },
        {
            title: "Watermelon",
            src: "QmVBiVmmjePpjbecFiAMwfU7w6bSBidr5odSiNfnTuf3oZ",
            price: "8",
        },
        {
            title: "Image9",
            src: "QmRq5JbdD8MXuaLYuK4phk1T9ucP4F16FTkyKoeNh4T5LA",
            price: "10",
        }
    ];


    const [hasBeenMinted, setHasBeenMinted] = useState([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isNewOpen, onOpen: onNewOpen, onOpenChange: onNewOpenChange } = useDisclosure();
    const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onOpenChange: onSuccessOpenChange } = useDisclosure();


    const [data, setdata] = useState({
        address: "",
    });
    const [provider, setProvider] = useState(null);
    const [auth, setAuth] = useState();
    const [contract, setContract] = useState(null);

    const btnhandler = () => {
        if (window.ethereum) {
            window.ethereum
                .request({ method: "eth_requestAccounts" })
                .then((res) =>
                    accountChangeHandler(res[0])
                );
        } else {
            alert("install metamask extension!!");
        }
    };

    useEffect(() => {
        let contract;
        const getProvider = async () => {
            const _provider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(_provider);
            if (_provider) {
                const signer = _provider.getSigner();
                console.log(signer);
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                })
                setdata({
                    address: accounts[0],
                });
                contract = new ethers.Contract(MemoriesABI.address, MemoriesABI.abi, signer);
                setContract(contract)
                // setAuth({ accountAddr: accounts[0], contract: new ethers.Contract(MemoriesABI.address, MemoriesABI.abi, signer), provider: _provider })
            }
        }
        getProvider().then(async () => {
            const tempArr = []
            for (let i = 0; i < list.length; i++) {
                tempArr.push(await contract.hasTokenBeenMinted(list[i].src));
                console.log(list[i].src, tempArr[i]);
            }
            return tempArr;
        }).then(setHasBeenMinted)
    }, [])

    // useEffect(() => {
    //     const initHasBeenMinted = async () => {
    //         const tempArr = []
    //         for(let i = 0; i < list.length; i++) {
    //             tempArr.push(await contract.hasTokenBeenMinted(list[i].src));
    //             console.log(list[i].src, tempArr[i]);
    //         }
    //         return tempArr;
    //     }
    //     initHasBeenMinted().then(setHasBeenMinted)
    // }, [contract])  

    const accountChangeHandler = (account) => {
        // Setting an address data
        setdata({
            address: account,
        });

    };

    const handleVote = async (tokenURI) => {
        console.log(tokenURI);
        try {
            let tx = await contract.vote(tokenURI);
            await tx.wait();
            console.log(tx);
            onSuccessOpen()
        } catch (err) {
            let errMsg = err.message.substring(err.message.indexOf("reverted: "));
            let finalErr = errMsg.substring(errMsg.indexOf(" ") + 1, errMsg.indexOf(`"`));
            if(finalErr.includes('Minted')){
                onNewOpen();
            } else {
                onOpen();
            }
        }
    }

    return (
        <NextUIProvider>
            <Navbar
                // isBordered={true}
                className='pt-4 pb-1'
            >
                <NavbarBrand isPressable className='cursor-pointer'>
                    <CameraIcon className='pt-1' sx={{ fontSize: "2em", color: "rgb(37 99 235)" }} />{" "}<p className="font-bold text-blue-600 text-2xl">PhotoMint</p>
                </NavbarBrand>
                {/* <NavbarContent className="hidden sm:flex gap-4" justify="center">
                    <NavbarItem>
                        <Link color="foreground" href="#">
                            Features
                        </Link>
                    </NavbarItem>
                </NavbarContent> */}
                <NavbarContent justify="end">
                    <NavbarItem>
                        <Button as={Link} color="primary" href="#" variant="flat" size='xl' onClick={btnhandler}>
                            <Image
                                src={MetamaskSVG}
                                alt="Metamask Logo"
                                width={25}
                            /> {data.address ? `${data.address}` : "Connect to Metamask"}
                        </Button>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>
            <div className="gap-5 grid grid-cols-10 sm:grid-cols-3 px-10 py-5">
                {list.map((item, index) => (
                    <Card shadow="md" key={index} isPressable onPress={() => console.log("item pressed")}>
                        <CardBody className="overflow-visible">
                            <Image
                                shadow="sm"
                                radius="lg"
                                width="100%"
                                className="w-full object-cover"
                                src={GetIpfsUrlFromPinata(item.src)}
                            />
                        </CardBody>
                        <CardFooter className="text-small justify-between">
                            <Button color="primary" onClick={() => handleVote(item.src)} variant='ghost'>
                                Vote
                            </Button>
                            <Button color={hasBeenMinted[index] ? 'success' : 'danger'} variant='flat'>
                                <p color={hasBeenMinted[index] ? 'success' : 'danger'} className='font-semibold'>{hasBeenMinted[index] ? "Minted" : "Not minted"}</p>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            <Modal
                backdrop="opaque"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                radius="2xl"
                classNames={{
                    body: "py-6",
                    backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                    base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                    header: "border-b-[1px] border-[#292f46]",
                    footer: "border-t-[1px] border-[#292f46]",
                    closeButton: "hover:bg-white/5 active:bg-white/10",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-lg font-black">Error</ModalHeader>
                            <ModalBody>
                                <p className='text-lg font-bold text-white'>
                                    You have already voted!
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="foreground" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal
                backdrop="opaque"
                isOpen={isNewOpen}
                onOpenChange={onNewOpenChange}
                radius="2xl"
                classNames={{
                    body: "py-6",
                    backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                    base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                    header: "border-b-[1px] border-[#292f46]",
                    footer: "border-t-[1px] border-[#292f46]",
                    closeButton: "hover:bg-white/5 active:bg-white/10",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-lg font-black">Error</ModalHeader>
                            <ModalBody>
                                <p className='text-lg font-bold text-white'>
                                    This photo has already been minted!
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="foreground" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal
                backdrop="opaque"
                isOpen={isSuccessOpen}
                onOpenChange={onSuccessOpenChange}
                radius="2xl"
                classNames={{
                    body: "py-6",
                    backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                    base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                    header: "border-b-[1px] border-[#292f46]",
                    footer: "border-t-[1px] border-[#292f46]",
                    closeButton: "hover:bg-white/5 active:bg-white/10",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-lg font-black">Success</ModalHeader>
                            <ModalBody>
                                <p className='text-lg font-bold text-white'>
                                    Voted!
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="foreground" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            {/* <Image 
                src={GetIpfsUrlFromPinata("QmWzoJE4F8WWH4cH5oTduNtqmTtuAL87YE3Tcc91Q3sdPP")}
                width={300}
            />
            <Button color="primary" onClick={() => handleVote("QmWzoJE4F8WWH4cH5oTduNtqmTtuAL87YE3Tcc91Q3sdPP")} variant='bordered'>
                Vote
            </Button> */}
        </NextUIProvider >
    )
}

export default App
