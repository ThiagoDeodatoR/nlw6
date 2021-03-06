import { FormEvent, useState } from "react";
import {useHistory} from "react-router-dom";

import { useAuthContext } from "../hooks/useAuthContext";

import { database } from "../services/firebase";

import { Button } from "../components/Button";

import illustrationImg from "../assets/images/illustration.svg";
import logoImg from "../assets/images/logo.svg";
import googleIconImg from "../assets/images/google-icon.svg";

import "../styles/auth.scss";





export function Home() {
    const history = useHistory();
    const [roomCode, setRoomCode ] = useState("");
    const { user, signInWithGoogle } = useAuthContext();

    async function handleCreateRoom() {
        if(!user){
            await signInWithGoogle();
        }

        history.push("/rooms/new"); 
    }

    async function handleJoinRoom(event:FormEvent) {
        event.preventDefault();

        if(roomCode.trim() === "") {
            alert("Please inform a room code.");
            return;
        }

        const roomRef = await database.ref(`rooms/${roomCode}`).get();

        if(!roomRef.exists()) {
            alert("Room does not exists.");
            return;
        }

        if(roomRef.val().endedAt) {
            alert("Room already closed");
            return;
        }

        history.push(`/rooms/${roomCode}`)
    }

    return (
        <div id="page-auth">  
            <aside>
                <img src={illustrationImg} alt="Illustração simbolizando perguntas e respostas" />
                <strong>Crie salas de Q&amp;A ao-vivo</strong>
                <p>Tire suas dúvidas da audiência em tempo-real</p>
            </aside>
            <main>
                <div className="main-content">
                    <img src={logoImg} alt="Let me Ask" />
                    <button className="create-room" onClick={handleCreateRoom}>
                        <img src={googleIconImg} alt="Logo do Google" />
                        Crie sua sala com o Google
                    </button>
                    <div className="separator">ou entre em uma sala</div>
                    <form onSubmit={handleJoinRoom}>
                        <input 
                            type="text" 
                            placeholder="Digite o código da sala"
                            onChange={event => setRoomCode(event.target.value)}
                            value={roomCode}
                        />
                        <Button type="submit">
                            Entrar na sala
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    );
}