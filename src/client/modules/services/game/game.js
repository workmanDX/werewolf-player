import { register, ValueChangedEvent } from '@lwc/wire-service';
import { fetchJson } from 'utils/fetch';

export const STAGES = Object.freeze({
    REGISTRATION: 'Registration1',
    PRE_QUESTION: 'Dealing',
    QUESTION: 'Question',
    QUESTION_RESULTS: 'QuestionResults',
    GAME_RESULTS: 'GameResults'
});

export function getGameInfo(config) {
    return new Promise((resolve, reject) => {
        const observer = {
            next: (data) => resolve(data),
            error: (error) => reject(error)
        };
        getData(config, observer);
    });
}

function getData(config, observer) {
    fetch('/api/game-info', {
        headers: {
            pragma: 'no-cache',
            'Cache-Control': 'no-cache'
        }
    })
        .then(fetchJson)
        .then((jsonResponse) => {
            observer.next(jsonResponse);
        })
        .catch((error) => {
            observer.error(error);
        });
}

register(getGameInfo, (eventTarget) => {
    let config;
    eventTarget.dispatchEvent(
        new ValueChangedEvent({ data: undefined, error: undefined })
    );

    const observer = {
        next: (data) =>
            eventTarget.dispatchEvent(
                new ValueChangedEvent({ data, error: undefined })
            ),
        error: (error) =>
            eventTarget.dispatchEvent(
                new ValueChangedEvent({ data: undefined, error })
            )
    };

    eventTarget.addEventListener('config', (newConfig) => {
        config = newConfig;
        getData(config, observer);
    });
    /*
    // Prevent duplicate initial REST call
    eventTarget.addEventListener('connect', () => {
        getData(config, observer);
    });
*/
});
