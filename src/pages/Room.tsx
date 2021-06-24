import { useState, FormEvent, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useAuthContext } from "../hooks/useAuthContext";

import logoImg from "../assets/images/logo.svg";

import { Button } from "../components/Button";
import { RoomCode } from "../components/RoomCode";


import "../styles/room.scss";
import { database } from "../services/firebase";


type FirebaseQuestions = Record<string, { //Record significa objeto, RECORD TEM UMA STRING (CODE DA SALA) QUE TEM UM OBJETO COM VALORES DENTRO
    author: {
        name: string;
        avatar: string;
    }
    content: string;
    isHighlighted: boolean;
    isAnswered: boolean;
}>

type Question = {
    id: string;
    author: {
        name: string;
        avatar: string;
    };
    content: string;
    isHighlighted: boolean;
    isAnswered: boolean;
}

type RoomParams = {
    id: string;
}

export function Room() {
    const { user } = useAuthContext();
    
    const params = useParams<RoomParams>();
    const roomId = params.id;
    const [newQuestion, setNewQuestion] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]); //UM ARRAY DE QUESTION
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
                    isAnswered: value.isAnswered
                }
            })

            setTitle(roomDB.title);
            setQuestions(parsedQuestions);
        })
    }, [roomId]);

    async function handleMakeQuestion(event:FormEvent) {
        event.preventDefault();

        if(newQuestion.trim() === '') {
            return;
        }

        if(!user) {
            throw new Error("You must be logged in.");
        }

        const question = {
            content: newQuestion,
            author: {
                name: user.name,
                avatar: user.avatar,

            },
            isHighlighted: false,
            isAnswered: false,
        };

        await database.ref(`rooms/${roomId}/questions`).push(question);

        setNewQuestion('');
    }

    return(
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Let me Ask" />
                    <RoomCode code={roomId}/>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span>} {/* IF SEM ELSE USASSE && */}
                </div>

                <form onSubmit={handleMakeQuestion}>
                    <textarea 
                        placeholder="O que você quer perguntar?" 
                        onChange={event => setNewQuestion(event.target.value)}
                        value={newQuestion}
                    />

                    <div className="form-footer">
                        { user ? (
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div>
                        ) : (
                            <span>Para enviar uma pergunta, <button>faça seu login.</button></span>
                        ) }
                        <Button type="submit" disabled={!user}>Enviar Pergunta</Button>
                    </div>
                </form>
                {JSON.stringify(questions)}
            </main>
        </div>
    );
}