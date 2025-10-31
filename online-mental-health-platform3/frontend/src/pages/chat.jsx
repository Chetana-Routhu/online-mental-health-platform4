import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]); // 🤖 Smart replies
  const [moodResult, setMoodResult] = useState(null); // 🧠 Mood summary popup
  const chatEndRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);

  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  const servers = { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] };

  // ✅ Auth check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate("/login");
      else setUser(currentUser);
    });
    return () => unsub();
  }, [navigate]);

  // ✅ Fetch messages
  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "chats", id, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const newMsgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(newMsgs);

      const lastMsg = newMsgs[newMsgs.length - 1];
      if (lastMsg && lastMsg.text) generateSmartReplies(lastMsg.text);
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, "chats", id, "messages"), {
      text,
      sender: user.email,
      timestamp: serverTimestamp(),
    });
    setText("");
  };

  // 🤖 AI Smart Replies
  const generateSmartReplies = async (lastMessage) => {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a kind and empathetic therapy assistant." },
            {
              role: "user",
              content: `Generate 3 short and supportive responses to this message: "${lastMessage}". Keep them conversational and caring.`,
            },
          ],
          max_tokens: 60,
        }),
      });
      const data = await res.json();
      const textContent = data?.choices?.[0]?.message?.content || "";
      const suggestions = textContent
        .split("\n")
        .map((s) => s.replace(/^\d+\.\s*/, "").trim())
        .filter((s) => s);
      setAiSuggestions(suggestions.slice(0, 3));
    } catch {
      setAiSuggestions([
        "I’m here for you 💙",
        "Would you like to talk more about it?",
        "That sounds really tough — take a deep breath.",
      ]);
    }
  };

  // ✅ Start & Join Call (WebRTC)
  const startCall = async () => {
    setInCall(true);
    const pc = new RTCPeerConnection(servers);
    peerConnection.current = pc;

    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = localStream;
    localVideoRef.current.srcObject = localStream;
    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

    const callDoc = doc(collection(db, "calls"));
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    pc.onicecandidate = async (e) => e.candidate && addDoc(offerCandidates, e.candidate.toJSON());
    const remoteStream = new MediaStream();
    remoteVideoRef.current.srcObject = remoteStream;
    pc.ontrack = (e) => e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);
    await setDoc(callDoc, { offer: offerDescription });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (data?.answer && !pc.currentRemoteDescription) {
        pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });

    alert(`📞 Share this Call ID: ${callDoc.id}`);
  };

  const joinCall = async () => {
    const callId = prompt("Enter Call ID:");
    if (!callId) return;
    const callDoc = doc(db, "calls", callId);
    const callData = (await getDoc(callDoc)).data();
    if (!callData) return alert("Invalid Call ID");

    const pc = new RTCPeerConnection(servers);
    peerConnection.current = pc;
    setInCall(true);

    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = localStream;
    localVideoRef.current.srcObject = localStream;
    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

    const remoteStream = new MediaStream();
    remoteVideoRef.current.srcObject = remoteStream;
    pc.ontrack = (e) => e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));

    pc.onicecandidate = async (e) =>
      e.candidate && addDoc(collection(callDoc, "answerCandidates"), e.candidate.toJSON());

    await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await setDoc(callDoc, { answer }, { merge: true });
  };

  // ✅ End Call + Analyze Mood
  const endCall = () => {
    peerConnection.current?.close();
    localVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;
    setInCall(false);
    analyzeMood();
  };

  // 🧠 Mood Analyzer
  const analyzeMood = () => {
    const recent = messages.slice(-10).map((m) => m.text.toLowerCase()).join(" ");
    const positiveWords = ["happy", "calm", "good", "love", "great", "relaxed"];
    const negativeWords = ["sad", "tired", "anxious", "angry", "worried", "bad"];

    const pos = positiveWords.filter((w) => recent.includes(w)).length;
    const neg = negativeWords.filter((w) => recent.includes(w)).length;

    let result;
    if (pos > neg)
      result = "😊 You seemed positive and relaxed during this session.";
    else if (neg > pos)
      result = "😔 You seemed a bit low or anxious. Take care and reach out if needed.";
    else
      result = "😐 You seemed neutral today. Keep checking in with yourself.";

    setMoodResult(result);
  };

  // Mic / Camera Toggle
  const toggleMic = () => {
    const track = localStreamRef.current?.getTracks().find((t) => t.kind === "audio");
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };
  const toggleCamera = () => {
    const track = localStreamRef.current?.getTracks().find((t) => t.kind === "video");
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h2>💬 MindConnect Chat</h2>
        <button style={styles.backBtn} onClick={() => navigate("/consultants")}>
          ⬅ Back
        </button>
      </header>

      <div style={styles.main}>
        {/* 🎥 Video Section */}
        <div style={styles.videoSection}>
          {inCall ? (
            <>
              <div style={styles.videoContainer}>
                <video ref={remoteVideoRef} autoPlay playsInline style={styles.remoteVideo} />
                <video ref={localVideoRef} autoPlay playsInline muted style={styles.localVideo} />
              </div>

              <div style={styles.controls}>
                <button onClick={toggleMic} style={styles.muteBtn}>{micOn ? "🎤" : "🔇"}</button>
                <button onClick={toggleCamera} style={styles.hideBtn}>{cameraOn ? "📹" : "🚫"}</button>
                <button onClick={endCall} style={styles.endCallBtn}>🔴</button>
              </div>
            </>
          ) : (
            <div style={styles.joinBox}>
              <button onClick={startCall} style={styles.startBtn}>▶ Start Call</button>
              <button onClick={joinCall} style={styles.joinBtn}>🔗 Join Call</button>
            </div>
          )}
        </div>

        {/* 💬 Chat Section */}
        <div style={styles.chatSection}>
          <div style={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.message,
                  alignSelf: msg.sender === user?.email ? "flex-end" : "flex-start",
                  background: msg.sender === user?.email ? "#2196F3" : "rgba(255,255,255,0.3)",
                }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          <form onSubmit={handleSend} style={styles.inputBar}>
            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.sendBtn}>➤</button>
          </form>

          {/* 🤖 Smart Replies */}
          <div style={styles.suggestions}>
            {(aiSuggestions.length ? aiSuggestions : [
              "I’m feeling anxious today 😔",
              "Can we schedule another session?",
              "Thank you for listening 💬",
            ]).map((s, i) => (
              <button key={i} style={styles.suggestionBtn} onClick={() => setText(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🧠 Mood Summary Popup */}
      {moodResult && (
        <div style={styles.moodPopup}>
          <div style={styles.moodContent}>
            <h3>🧠 Mood Summary</h3>
            <p>{moodResult}</p>
            <button onClick={() => setMoodResult(null)} style={styles.closeBtn}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎨 Styles
const styles = {
  wrapper: {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Poppins', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
  },
  backBtn: {
    background: "rgba(255,255,255,0.3)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
  },
  main: { flex: 1, display: "flex", gap: "1.5rem", padding: "1rem 2rem" },
  videoSection: {
    flex: 3,
    background: "rgba(255,255,255,0.15)",
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  videoContainer: { display: "flex", gap: "1rem" },
  remoteVideo: { width: "70%", borderRadius: "12px", background: "#000" },
  localVideo: { width: "25%", borderRadius: "12px", background: "#222" },
  controls: { position: "absolute", bottom: "25px", display: "flex", gap: "1rem" },
  muteBtn: {
    background: "#1976D2",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "55px",
    height: "55px",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  hideBtn: {
    background: "#0288D1",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "55px",
    height: "55px",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  endCallBtn: {
    background: "#D32F2F",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "65px",
    height: "65px",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  joinBox: { display: "flex", gap: "1rem" },
  startBtn: {
    background: "#1565C0",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.9rem 1.8rem",
    cursor: "pointer",
  },
  joinBtn: {
    background: "#1E88E5",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.9rem 1.8rem",
    cursor: "pointer",
  },
  chatSection: {
    flex: 1,
    background: "rgba(255,255,255,0.15)",
    borderRadius: "15px",
    display: "flex",
    flexDirection: "column",
  },
  messages: {
    flex: 1,
    padding: "1rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  message: {
    maxWidth: "70%",
    padding: "0.6rem 1rem",
    borderRadius: "10px",
    color: "#fff",
  },
  inputBar: {
    display: "flex",
    padding: "0.8rem",
    borderTop: "1px solid rgba(255,255,255,0.2)",
  },
  input: {
    flex: 1,
    border: "none",
    borderRadius: "10px",
    padding: "0.8rem",
    outline: "none",
  },
  sendBtn: {
    background: "#1565C0",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.8rem 1rem",
    marginLeft: "0.5rem",
    cursor: "pointer",
  },
  suggestions: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    padding: "0.8rem 1rem",
    justifyContent: "center",
    background: "rgba(255,255,255,0.1)",
    borderBottomLeftRadius: "15px",
    borderBottomRightRadius: "15px",
  },
  suggestionBtn: {
    background: "linear-gradient(135deg, #00c6ff, #0072ff)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  moodPopup: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  moodContent: {
    background: "#fff",
    color: "#333",
    borderRadius: "12px",
    padding: "2rem",
    textAlign: "center",
    width: "80%",
    maxWidth: "400px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
  },
  closeBtn: {
    marginTop: "1rem",
    background: "#1565C0",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
  },
};
