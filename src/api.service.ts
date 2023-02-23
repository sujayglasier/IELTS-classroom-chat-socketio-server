import axios from 'axios';

type User = {
    user_id: string;
    type: string;
};

type GetUsersResponse = {
    user: User[];
    status: string;
    message: string;
};

export class apiService {
    public baseUrl = 'https://www.medicsportal.org/class_room_webservice';

    public async getClassroomChatMessageList(roomId: string) {
        try {
            const { data, status } = await axios.post<any>(
                this.baseUrl + '/get_classroom_chat_message_list', { 
                    room_id: roomId
                }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/x-www-form-urlencoded',
                    },
                },
            );
            // console.log(JSON.stringify(data, null, 4));
            console.log('response status is: ', status);
            // console.log('response status is: ', data);

            if (data.status) {
                let messageList = Array.isArray(data.message_list) ? data.message_list : [];
                messageList = messageList.map((item: any) => {
                    return {
                        // id: item?.message_id ?? "",
                        // room_id: item?.room_id ?? "",
                        // user_id: item?.user_id ?? "",
                        // type: item?.type ?? "",
                        // message_type: item?.message_type ?? "",
                        // message: item?.text ?? "",
                        // created_date: item?.created_date ?? "",

                        id: item?.message_id ?? "",
                        roomId: item?.room_id ?? "",
                        senderId: item?.user_id ?? "",
                        message: item?.text ?? "",
                        messageType: item?.message_type ?? "",
                        createdAt: item?.created_date ?? "",
                    }
                })
                return messageList;
            }
            return data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log('error message: ', error.message);
                return error.message;
            } else {
                console.log('unexpected error: ', error);
                return 'An unexpected error occurred';
            }
        }
    }

    public async getClassroomUserList(roomId: string) {
        try {
            const { data, status } = await axios.post<any>(
                this.baseUrl + '/get_classroom_user_list', { 
                    room_id: roomId
                }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/x-www-form-urlencoded',
                    },
                },
            );
            // console.log(JSON.stringify(data, null, 4));
            console.log('response status is: ', status);
            // console.log('response status is: ', data);

            if (data.status) {
                return Array.isArray(data.user_list) ? data.user_list : [];
            }
            return data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log('error message: ', error.message);
                return error.message;
            } else {
                console.log('unexpected error: ', error);
                return 'An unexpected error occurred';
            }
        }
    }

    public async storeChatMessage(roomId: string, userId: string, userType: string, message: string, messageType: string) {
        try {
            const { data, status } = await axios.post<any>(
                this.baseUrl + '/store_chat_message', { 
                    room_id: roomId,
                    user_id: userId,
                    type: userType,  // tutor || lerner
                    text: message,
                    message_type: messageType //1,2,3,4,5 (1= Text, 2=Image, 3=Video, 4= PDF, 5 Call/Audio)
                }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/x-www-form-urlencoded',
                    },
                },
            );
            // console.log(JSON.stringify(data, null, 4));
            console.log('response status is: ', status);
            console.log('response status is: ', data);

            if (data.status) {
                let messageObj = data.message_list
                return {
                    id: messageObj?.message_id ?? "",
                    roomId: messageObj?.room_id ?? "",
                    senderId: messageObj?.user_id ?? "",
                    message: messageObj?.text ?? "",
                    messageType: messageObj?.message_type ?? "",
                    createdAt: messageObj?.created_date ?? "",
                };
            }
            return data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log('error message: ', error.message);
                return error.message;
            } else {
                console.log('unexpected error: ', error);
                return 'An unexpected error occurred';
            }
        }
    }

}