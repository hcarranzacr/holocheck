/**
 * Audio Recording Service
 * Handles audio recording functionality for voice analysis
 */

// Start audio recording
export const startAudioRecording = async (stream) => {
  try {
    if (!stream) {
      throw new Error('No media stream provided for audio recording');
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      throw new Error('No audio tracks found in stream');
    }

    // Create MediaRecorder for audio
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    const audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start(1000); // Collect data every second

    return {
      recorder: mediaRecorder,
      chunks: audioChunks,
      stop: () => {
        return new Promise((resolve) => {
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            resolve(audioBlob);
          };
          mediaRecorder.stop();
        });
      }
    };
  } catch (error) {
    console.error('Failed to start audio recording:', error);
    throw error;
  }
};

// Stop audio recording
export const stopAudioRecording = async (audioRecorder) => {
  try {
    if (!audioRecorder || !audioRecorder.stop) {
      console.warn('No valid audio recorder provided');
      return null;
    }

    const audioBlob = await audioRecorder.stop();
    return audioBlob;
  } catch (error) {
    console.error('Failed to stop audio recording:', error);
    return null;
  }
};

export default {
  startAudioRecording,
  stopAudioRecording
};