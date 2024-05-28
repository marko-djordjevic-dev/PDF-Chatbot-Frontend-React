import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useToast } from './toast';
import apiClient from '../utils/apiClient';

interface Props {
    bot_id: string
}
interface FileItem {
    id: number;
    name: string;
}

const ChatbotModel: React.FC<Props> = ({ bot_id }) => {
    const [chatbotPrompt, setChatbotPrompt] = useState<string>('');
    const [chatbotName, setChatBotName] = useState<string>('');
    const [files, setFiles] = useState<FileItem[]>([]);
    const { addToast } = useToast();

    const handleChatbotPromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setChatbotPrompt(event.target.value);
    };

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        apiClient.post(`${import.meta.env.VITE_API_URL}/chatbot/update_model_info`, {
            id: bot_id,
            name: chatbotName,
            prompt: chatbotPrompt
        })
            .then(_ => {
                addToast("successfully updated", 'success')
            })
            .catch(error => {
                addToast(error.response.data.message, 'error')
            })
    }

    useEffect(() => {
        setFiles([])
        apiClient.post(`${import.meta.env.VITE_API_URL}/chatbot/get_model_info`, {
            id: bot_id
        })
            .then((response: any) => {
                const data = response.data
                setChatbotPrompt(data.prompt)
                setChatBotName(data.name)

                data.file_names.forEach((name: string, index: number) => {
                    setFiles(prev => [...prev, { id: index, name: name }])
                })
            })
    }, [bot_id])
    return (
        <div className="w-full h-full p-5 flex flex-col gap-3">
            <div className="prose xl:prose-xl">
                <h1>Chat Interface</h1>
            </div>
            <h3 className="font-bold text-lg">Set your chatbot model</h3>
            <form id='chatbot_form' className="form-control space-y-4" onSubmit={onSubmit}>
                <div className='flex gap-3'>
                    <input
                        type='text'
                        className='input input-bordered w-full'
                        placeholder='Chatbot Name'
                        required
                        value={chatbotName}
                        onChange={(e) => setChatBotName(e.target.value)}
                    />
                    <button className='btn btn-outline' type='submit'>Save</button>
                </div>
                <textarea
                    className="textarea textarea-bordered w-full h-[300px]"
                    placeholder="Write instruction here"
                    value={chatbotPrompt}
                    onChange={handleChatbotPromptChange}
                    required
                >
                </textarea>
            </form>
            <div className='divider' />
            <p className="font-bold text-lg">Uploaded files</p>
            <div className="container">
                <ul className="list-disc overflow-auto max-h-[300px]">
                    {files.map(file => (
                        <li key={file.id} className="flex justify-between items-center p-2">
                            {file.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ChatbotModel;
