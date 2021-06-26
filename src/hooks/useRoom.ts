import { useEffect, useState } from "react";

import { useAuthContext } from "./useAuthContext";

import { database } from "../services/firebase";


type QuestionType = {
    id: string;
    author: {
        name: string;
        avatar: string;
    };
    content: string;
    isHighlighted: boolean;
    isAnswered: boolean;
    likeCount: number;
    likeId: string | undefined;
}

type FirebaseQuestions = Record<string, { //Record significa objeto, RECORD TEM UMA STRING (CODE DA SALA) QUE TEM UM OBJETO COM VALORES DENTRO
    author: {
        name: string;
        avatar: string;
    }
    content: string;
    isHighlighted: boolean;
    isAnswered: boolean;
    likes: Record<string, {
        authorId: string;
    }>
}>

export function useRoom(roomId: string) {
    const { user } = useAuthContext();
    const [questions, setQuestions] = useState<QuestionType[]>([]); //UM ARRAY DE QUESTION
    const [title, setTitle] = useState("");

    //PELO O VALOR ESTAR VOLTANDO COMO OBJETO É PRECISO FAZER O OBJECT.ENTRIES PARA QUE O VALOR SEJA SOMENTE O ARRAY E NÃO UM OBJETO
    
    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}`);

        roomRef.on('value', room => { //ouvindo evento value do firebase, se quiser ouvir uma vez use once e mais de uma vez usar on
            const roomDB = room.val();
            const firebaseQuestions: FirebaseQuestions = roomDB.questions ?? {}; //QUESTIONS VEM DO FIREBASE

            const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                return {
                    id: key,
                    content: value.content,
                    author: value.author,
                    isHighlighted: value.isHighlighted,
                    isAnswered: value.isAnswered,
                    likeCount: Object.values(value.likes ?? {}).length,
                    likeId: Object.entries(value.likes ?? {}).find(([ key, like ]) => like.authorId === user?.id)?.[0],
                }
            })

            setTitle(roomDB.title);
            setQuestions(parsedQuestions);
        })

        return () => {
            roomRef.off('value');
        }
    }, [roomId, user?.id]);

    return { questions, title}
}