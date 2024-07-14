import React from 'react'
import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  IconButton,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  useDisclosure,
  Input,
  useToast,
  Box,
  Spinner,
} from "@chakra-ui/react";

import { ChatState } from '../../Context/ChatProvider';
import axios from "axios";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import { useState } from "react";
import UserListItem from "../UserAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain,fetchMessages }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
     const [groupChatName, setGroupChatName] = useState();
     const [search, setSearch] = useState("");
     const [searchResult, setSearchResult] = useState([]);
     const [loading, setLoading] = useState(false);
    const [renameloading, setRenameloading] = useState(false);
    const toast = useToast();
    
   const handleRemove = async (user1) => {
     if (selectedchat.groupAdmin._id !== user._id && user1._id !== user._id) {
       toast({
         title: "Only admins can remove someone!",
         status: "error",
         duration: 5000,
         isClosable: true,
         position: "bottom",
       });
       return;
     }

     try {
       setLoading(true);
       const config = {
         headers: {
           Authorization: `Bearer ${user.token}`,
         },
       };
       const { data } = await axios.put(
         `/api/chat/groupremove`,
         {
           chatId: selectedchat._id,
           userId: user1._id,
         },
         config
       );

       user1._id === user._id ? setSelectedchat() : setSelectedchat(data);
       setFetchAgain(!fetchAgain);
       fetchMessages();
       setLoading(false);
     } catch (error) {
       toast({
         title: "Error Occured!",
         description: error.response.data.message,
         status: "error",
         duration: 5000,
         isClosable: true,
         position: "bottom",
       });
       setLoading(false);
     }
     setGroupChatName("");
   };
    const handleRename = async () => {
        if (!groupChatName) return
        try {
          setRenameloading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.put(
            `/api/chat/rename`,
            {
              chatId: selectedchat._id,
              chatName: groupChatName,
            },
            config
          );

          console.log(data._id);
          // setSelectedChat("");
          setSelectedchat(data);
          setFetchAgain(!fetchAgain);
          setRenameloading(false);
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: error.response.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setRenameloading(false);
        }
        setGroupChatName("");
     };
    const handleSearch = async (query) => {
      setSearch(query);
      if (!query) {
        return;
      }

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(`/api/user?search=${search}`, config);
        console.log(data);
        setLoading(false);
        setSearchResult(data);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Search Results",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
        setLoading(false);
      }
    };
    const handleAddUser = async (user1) => {
      if (selectedchat.users.find((u) => u._id === user1._id)) {
        toast({
          title: "User Already in group!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      if (selectedchat.groupAdmin._id !== user._id) {
        toast({
          title: "Only admins can add someone!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.put(
          `/api/chat/groupadd`,
          {
            chatId: selectedchat._id,
            userId: user1._id,
          },
          config
        );

        setSelectedchat(data);
        setFetchAgain(!fetchAgain);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      }
      setGroupChatName("");
    };
    

    const { selectedchat, setSelectedchat, user } = ChatState();
    return (
      <>
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
        />

        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="35px"
              fontFamily="Work sans"
              display="flex"
              justifyContent="center"
            >
              {selectedchat.chatName}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                {selectedchat.users.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    // admin={selectedchat.groupAdmin}
                    handleFunction={() => handleRemove(u)}
                  />
                ))}
              </Box>
              <FormControl display="flex">
                <Input
                  placeholder="Chat Name"
                  mb={3}
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Button
                  variant="solid"
                  colorScheme="teal"
                  ml={1}
                  isLoading={renameloading}
                  onClick={handleRename}
                >
                  Update
                </Button>
              </FormControl>
              <FormControl>
                <Input
                  placeholder="Add User to group"
                  mb={1}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </FormControl>
              {loading ? (
                <Spinner size="lg" />
              ) : (
                searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleAddUser(user)}
                  />
                ))
              )}
            </ModalBody>

            <ModalFooter>
              <Button onClick={() => handleRemove(user)} colorScheme="red">
                Leave Group
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
}

export default UpdateGroupChatModal
