import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

export default function VideoCall() {
  const { roomID } = useParams();
  const navigate = useNavigate();

  const myMeeting = async (element) => {
    // 1. User ki details nikalna (kaun join kar raha hai)
    const storedUser = localStorage.getItem('user');
    let userID = "Guest_" + Math.floor(Math.random() * 10000);
    let userName = "Guest User";

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      userID = parsedUser._id || parsedUser.id || userID;
      userName = parsedUser.name || "User";
      
      // Agar Doctor hai toh naam ke aage "Dr." lagayenge
      if (parsedUser.role === 'doctor' && !userName.startsWith('Dr.')) {
          userName = "Dr. " + userName;
      }
    }

    // 2. Aapki API Keys ko .env se secure tarike se lena
    const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
    
    // 3. Token Generate Karna
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );

    // 4. Video Call Interface Create Karna
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // 5. Room Join Karna
    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Meeting Link',
          url: window.location.origin + '/room/' + roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall, // 1-on-1 private call
      },
      showPreJoinView: true, // Camera/Mic test karne wali screen
      onLeaveRoom: () => {
        // Call katne ke baad wapas dashboard bhejna
        const role = storedUser ? JSON.parse(storedUser).role : 'patient';
        navigate(role === 'doctor' ? '/doctor-dashboard' : '/dashboard');
      }
    });
  };

  return (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full h-full" ref={myMeeting} />
    </div>
  );
}