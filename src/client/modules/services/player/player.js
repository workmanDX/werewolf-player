import { register, ValueChangedEvent } from '@lwc/wire-service';
import { fetchJson } from 'utils/fetch';

const PLAYERS_REST_URL = '/api/players';

/**
 * Checks if a given player nickname is available
 * @param {*} config object that contains nickname
 */
export function isNicknameAvailable(config) {
    return new Promise((resolve, reject) => {
        const observer = {
            next: (data) => resolve(data),
            error: (error) => reject(error)
        };
        getNicknameData(config, observer);
    });
}

/**
 * Checks if a given player id is valid
 * @param {*} config object that contains Id
 */
export function isPlayerIdValid(config) {
    return new Promise((resolve, reject) => {
        const observer = {
            next: (data) => resolve(data),
            error: (error) => reject(error)
        };
        getPlayerIdData(config, observer);
    });
}

/**
 * Gets a player's leaderboard (score and rank)
 * @param {*} config
 */
export function getPlayerLeaderboard(config) {
    return new Promise((resolve, reject) => {
        const observer = {
            next: (data) => resolve(data),
            error: (error) => reject(error)
        };
        getPlayerLeaderboardData(config, observer);
    });
}

/**
 * Gets player's stats
 * @param {*} config
 */
export function getPlayerStats(config) {
    return new Promise((resolve, reject) => {
        const observer = {
            next: (data) => resolve(data),
            error: (error) => reject(error)
        };
        getPlayerStatsData(config, observer);
    });
}

/**
 * Registers a player
 * @param {string} nickname
 * @param {string} email
 * @returns {Promise<*>} Promise holding the Player record
 */
export function registerPlayer(nickname, gameId) {
    const userInfo = { nickname, gameId };
    return fetch(PLAYERS_REST_URL, {
        method: 'get',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInfo)
    }).then(fetchJson);
}

function getPlayerIdData(config, observer) {
    const playerId = config && config.playerId ? config.playerId : null;
    if (playerId === null) {
        observer.next({ playerId: '', isValid: false });
        return;
    }

    // Call players API to check if playerId is available (cache disabled)
    fetch(`${PLAYERS_REST_URL}Validate?playerId=${playerId}`, {
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

function getNicknameData(config, observer) {
    const nickname = config && config.nickname ? config.nickname : null;
    if (nickname === null) {
        observer.next({ nickname: '', isAvailable: true });
        return;
    }

    // Call players API to check if nickname is available (cache disabled)
    fetch(`${PLAYERS_REST_URL}?nickname=${nickname}`, {
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

function getPlayerLeaderboardData(config, observer) {
    const playerId = config && config.playerId ? config.playerId : null;
    if (playerId === null) {
        return;
    }

    // Call players API to get player's leaderboard (score and rank)
    fetch(`${PLAYERS_REST_URL}/${playerId}/leaderboard`, {
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

function getPlayerStatsData(config, observer) {
    const playerId = config && config.playerId ? config.playerId : null;
    if (playerId === null) {
        return;
    }

    // Call players API to get player's stats
    fetch(`${PLAYERS_REST_URL}/${playerId}/stats`)
        .then(fetchJson)
        .then((jsonResponse) => {
            observer.next(jsonResponse);
        })
        .catch((error) => {
            observer.error(error);
        });
}

register(isPlayerIdValid, (eventTarget) => {
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
        getPlayerIdData(config, observer);
    });

    eventTarget.addEventListener('connect', () => {
        getPlayerIdData(config, observer);
    });
});

register(getNicknameData, (eventTarget) => {
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
        getNicknameData(config, observer);
    });

    eventTarget.addEventListener('connect', () => {
        getNicknameData(config, observer);
    });
});

register(isNicknameAvailable, (eventTarget) => {
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
        getNicknameData(config, observer);
    });

    eventTarget.addEventListener('connect', () => {
        getNicknameData(config, observer);
    });
});

register(getPlayerLeaderboard, (eventTarget) => {
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
        getPlayerLeaderboardData(config, observer);
    });

    eventTarget.addEventListener('connect', () => {
        getPlayerLeaderboardData(config, observer);
    });
});

register(getPlayerStats, (eventTarget) => {
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
        getPlayerStatsData(config, observer);
    });

    eventTarget.addEventListener('connect', () => {
        getPlayerStatsData(config, observer);
    });
});
