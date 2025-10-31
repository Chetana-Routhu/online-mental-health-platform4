// frontend/src/pages/VideoCall.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

export default function VideoCall() {
  const { id } = useParams(); // consultant id or call id
  const navigate = useNavigate();

  const [callId, setCallId] = useState("");
  const [joined, setJoined] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);

  // ⚙️ WebRTC configuration
  const servers = {
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302"] },
    ],
  };

  // 🎥 Start local stream
  const startStream = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = localStream;
    return localStream;
  };

  // 📞 Create a call (user initiates)
  const createCall = async () => {
    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    const localStream = await startStream();
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    const callDoc = doc(collection(db, "calls"));
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    setCallId(callDoc.id);

    // ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    // Remote stream
    const remoteStream = new MediaStream();
    remoteVideoRef.current.srcObject = remoteStream;
    pc.ontrack = (event) => event.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));

    // Create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    await setDoc(callDoc, { offer });

    // Listen for answer
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    // Listen for remote ICE
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });

    alert(`📞 Share this Call ID: ${callDoc.id}`);
  };

  // 🔗 Join existing call (consultant joins)
  const joinCall = async () => {
    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    const callDoc = doc(db, "calls", callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    const localStream = await startStream();
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    const remoteStream = new MediaStream();
    remoteVideoRef.current.srcObject = remoteStream;
    pc.ontrack = (event) => event.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    const callData = (await onSnapshot(callDoc, () => {})).data;
    const callSnapshot = await (await import("firebase/firestore")).getDoc(callDoc);
    const call = callSnapshot.data();
    if (!call) {
      alert("Invalid Call ID");
      return;
    }

    const offerDescription = call.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
    await updateDoc(callDoc, { answer });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    setJoined(true);
  };

  const endCall = () => {
    pcRef.current?.close();
    localVideoRef.current.srcObject?.getTracks().forEach((t) => t.stop());
    remoteVideoRef.current.srcObject = null;
    navigate("/dashboard");
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={{ color: "#fff" }}>🎥 Video Consultation</h2>

      <div style={styles.videos}>
        <video ref={localVideoRef} autoPlay playsInline muted style={styles.video}></video>
        <video ref={remoteVideoRef} autoPlay playsInline style={styles.video}></video>
      </div>

      <div style={styles.controls}>
        <button style={styles.btn} onClick={createCall}>
          Create Call
        </button>

        <input
          placeholder="Enter Call ID"
          value={callId}
          onChange={(e) => setCallId(e.target.value)}
          style={styles.input}
        />

        <button style={styles.btn} onClick={joinCall}>
          Join Call
        </button>

        <button style={{ ...styles.btn, background: "#ff4b5c" }} onClick={endCall}>
          End Call
        </button>
      </div>
    </div>
  );
}

// 🎨 Styles
const styles = {
  wrapper: {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #74ebd5, #9face6)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Poppins', sans-serif",
    color: "#fff",
  },
  videos: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  video: {
    width: "300px",
    height: "220px",
    background: "#000",
    borderRadius: "10px",
  },
  controls: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "1.5rem",
    alignItems: "center",
  },
  btn: {
    background: "#00c9ff",
    border: "none",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    padding: "0.5rem",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    width: "160px",
  },
};
