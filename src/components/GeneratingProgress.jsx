import React from 'react';
import './GeneratingProgress.css';

const GeneratingProgress = ({ progress, timeLeft, requestId }) => {
    if (progress === undefined || progress === null) return null;

    return (
        <div className="generating-progress-container">
            <div className="generating-progress">
                <div className="progress-header">
                    <div className="progress-icon">🎨</div>
                    <div className="progress-title">Generating Image</div>
                    {requestId && (
                        <div className="request-id">ID: {requestId}</div>
                    )}
                </div>

                <div className="progress-content">
                    <div className="progress-info">
                        <span className="progress-text">Progress</span>
                        <span className="progress-percentage">{progress}%</span>
                    </div>

                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {timeLeft && (
                        <div className="time-left">
                            <span className="time-icon">⏱️</span>
                            <span>Time left: {timeLeft}s</span>
                        </div>
                    )}
                </div>

                {progress >= 100 && (
                    <div className="progress-complete">
                        <span className="complete-icon">✅</span>
                        <span>Generation Complete!</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeneratingProgress;
