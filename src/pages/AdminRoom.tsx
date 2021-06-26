import { useHistory, useParams } from "react-router-dom";

//import { useAuthContext } from "../hooks/useAuthContext";
import { useRoom } from "../hooks/useRoom";

import logoImg from "../assets/images/logo.svg";
import deleteImg from "../assets/images/delete.svg";

import { Button } from "../components/Button";
import { RoomCode } from "../components/RoomCode";
import { Question } from "../components/Question";

import { database } from "../services/firebase";

import "../styles/room.scss";




type RoomParams = {
    id: string;
}

export function AdminRoom() {
    const history = useHistory();
    const params = useParams<RoomParams>();
    const roomId = params.id;

    //const { user } = useAuthContext();
    const { title, questions } = useRoom(roomId);

    async function handleDeleteQuestion(questionId: string) {
        if(window.confirm("Tem certeza que deseja excluir essa pergunta?")) {
            await database.ref(`rooms/${roomId}/questions/${questionId}`).remove()
        }
    }    

    async function handleEndRoom() {
       await database.ref(`rooms/${roomId}`).update({
           endedAt: new Date(),
       })

       history.push("/");
    }


    return(
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Let me Ask" />
                    <div>
                        <RoomCode code={roomId}/>
                        <Button isOutlined onClick={handleEndRoom}>Encerrar Sala</Button>
                    </div>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span>} {/* IF SEM ELSE USASSE && */}
                </div>

                <div className="question-list">
                    {questions.map(question => {
                        return (
                            <Question 
                                key= {question.id}
                                content= {question.content}
                                author= {question.author}
                            >
                                <button
                                    type="button"
                                    onClick= {() => handleDeleteQuestion(question.id)}
                                >
                                    <img src={deleteImg} alt="Excluir pergunta" />
                                </button>
                            </Question>
                        )
                    })}
                </div>
            </main>
        </div>
    );
}