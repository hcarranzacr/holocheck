# HoloCheck - Sistema Biométrico Profesional - Diseño del Sistema

## Implementation approach

Analizando los puntos difíciles de los requerimientos, el sistema debe:
1. **Detección facial en tiempo real** con umbrales optimizados para condiciones reales
2. **Grabación automática** cuando el rostro esté estabilizado
3. **Análisis biométrico completo** de 36+ biomarcadores usando rPPG y análisis vocal
4. **Compatibilidad universal** con Safari, Chrome y Firefox

**Framework seleccionado:** React 18 con hooks para manejo de estado complejo, MediaRecorder API para grabación, Canvas API para análisis de video, y Web Audio API para análisis vocal.

**Arquitectura:** Componente principal BiometricCapture que orquesta detección facial, grabación automática, y procesamiento biométrico en tiempo real.

## Data structures and interfaces

```mermaid
classDiagram
    class BiometricCapture {
        +useState() hooks
        +useRef() refs
        +useEffect() lifecycle
        +initializeMedia() Promise~void~
        +startFaceDetection() void
        +startCapture() Promise~void~
        +stopCapture() void
        +executeComprehensiveAnalysis() Promise~void~
        +processRecordedData(blob: Blob) Promise~void~
        -detectFaceInFrame() boolean
        -calculateRealSignalQuality() number
        -getSupportedMimeType() string
    }

    class BiometricProcessor {
        +initialize(video: HTMLVideoElement, audioEnabled: boolean) Promise~InitResult~
        +startAnalysis(video: HTMLVideoElement, audioStream: MediaStream) Promise~boolean~
        +stopAnalysis() void
        +executeAnalysis() Promise~AnalysisResult~
        +setCallback(event: string, callback: Function) void
        +cleanup() void
    }

    class FaceDetection {
        +detected: boolean
        +confidence: number
        +position: Position
        +stable: boolean
        +stableFrames: number
    }

    class BiometricData {
        +heartRate: number
        +heartRateVariability: number
        +bloodPressure: string
        +oxygenSaturation: number
        +rmssd: number
        +sdnn: number
        +pnn50: number
        +lfHfRatio: number
        +fundamentalFrequency: number
        +jitter: number
        +shimmer: number
        +vocalStress: number
    }

    class MediaRecorderManager {
        +mediaRecorder: MediaRecorder
        +chunks: Blob[]
        +startRecording(stream: MediaStream, options: RecorderOptions) void
        +stopRecording() void
        +onDataAvailable(event: BlobEvent) void
        +onError(event: MediaRecorderErrorEvent) void
    }

    class SystemLogger {
        +logs: LogEntry[]
        +addLog(message: string, type: LogType) void
        +clearLogs() void
        +showLogs: boolean
    }

    BiometricCapture --> BiometricProcessor : uses
    BiometricCapture --> FaceDetection : manages
    BiometricCapture --> BiometricData : updates
    BiometricCapture --> MediaRecorderManager : controls
    BiometricCapture --> SystemLogger : logs to
```

## Program call flow

```mermaid
sequenceDiagram
    participant U as User
    participant BC as BiometricCapture
    participant FD as FaceDetection
    participant MR as MediaRecorder
    participant BP as BiometricProcessor
    participant SL as SystemLogger

    U->>BC: Component Mount
    BC->>SL: addLog("Initializing system")
    BC->>BC: initializeMedia()
    BC->>BC: getUserMedia(constraints)
    BC->>BP: initialize(video, audioEnabled)
    BP-->>BC: InitResult{success: true}
    BC->>FD: startFaceDetection()
    
    loop Face Detection Loop (every 100ms)
        FD->>FD: detectFaceInFrame()
        FD->>FD: calculateRealSignalQuality()
        FD->>BC: updateFaceDetection(detected, confidence, stable)
        
        alt Face Stable AND Auto-start Enabled
            BC->>SL: addLog("Face stabilized - Starting recording")
            BC->>BC: startCapture()
        end
    end

    BC->>MR: new MediaRecorder(stream, options)
    BC->>MR: start(100)
    MR->>BC: onstart event
    BC->>SL: addLog("Recording started")
    BC->>BP: startAnalysis(video, audioStream)
    
    loop Recording Loop (30 seconds)
        MR->>BC: ondataavailable(chunk)
        BC->>BC: updateProgress()
        BC->>BP: processFrame()
        BP->>BC: onAnalysisUpdate(metrics)
        BC->>BC: updateBiometricData(metrics)
    end

    BC->>MR: stop()
    MR->>BC: onstop event
    BC->>BC: processRecordedData(blob)
    BC->>BP: executeAnalysis()
    BP-->>BC: AnalysisResult{36+ biomarkers}
    BC->>BC: updateFinalBiometricData()
    BC->>U: onAnalysisComplete(results)
```

## Anything UNCLEAR

1. **Auto-start Recording**: El sistema actual requiere click manual del botón "Iniciar Análisis". Necesitamos implementar auto-start cuando el rostro esté estabilizado.

2. **MediaRecorder State Management**: El MediaRecorder puede fallar silenciosamente en Safari. Necesitamos validación robusta del estado y reintentos automáticos.

3. **Face Detection Thresholds**: Los umbrales actuales (25%/30%) pueden ser demasiado bajos para algunas condiciones de iluminación. Necesitamos ajuste dinámico.

4. **Error Recovery**: El sistema necesita recuperación automática de errores sin intervención del usuario.

**SOLUCIÓN CRÍTICA REQUERIDA:** Implementar auto-start de grabación cuando `faceDetection.stable && faceDetection.detected` sea true, eliminando la dependencia del click manual del usuario.