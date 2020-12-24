const Configuration = require('../utils/configuration.js');

module.exports = class PlayerRestResource {
    constructor(sfdc) {
        this.sfdc = sfdc;
    }

    isNicknameAvailable(request, response) {
        const { nickname } = request.query;
        if (!nickname) {
            response
                .status(400)
                .json({ message: 'Missing nickname parameter.' });
            return;
        }

        const ns = Configuration.getSfNamespacePrefix();
        const soql = `SELECT Id FROM ${ns}Game_Player__c WHERE Name__c='${nickname}'`;
        this.sfdc.query(soql, (error, result) => {
            if (error) {
                console.error('isNicknameAvailable', error);
                response.sendStatus(500);
            } else {
                response.json({
                    nickname,
                    isAvailable: result.records.length === 0
                });
            }
        });
    }

    registerPlayer(request, response) {
        const { nickname, gameId } = request.body;
        if (!nickname) {
            response
                .status(400)
                .json({ message: 'Missing nickname parameter.' });
            return;
        }

        const playerRecord = { Name__c: nickname, Game__c: gameId };
        this.sfdc
            .sobject(`Game_Player__c`)
            .insert(playerRecord, (error, result) => {
                if (error || !result.success) {
                    if (
                        error.errorCode &&
                        error.fields &&
                        error.errorCode ===
                            'FIELD_CUSTOM_VALIDATION_EXCEPTION' &&
                        error.fields.includes('Name')
                    ) {
                        response.status(409).json({
                            message: `Nickname '${nickname}' is already in use.`
                        });
                    } else {
                        window.console.log('registerPlayer ', error);
                        response
                            .status(500)
                            .json({ message: 'Failed to register player.' });
                    }
                } else {
                    response.json(result);
                }
            });
    }

    isPlayerIdValid(request, response) {
        const { playerId } = request.query;
        if (!playerId) {
            response
                .status(400)
                .json({ message: 'Missing playerId parameter.' });
            return;
        }

        // response.json({message: 'we got to here'});
        // return;

        const soql = `SELECT Id, Game__r.Stage__c, Game__r.Activity__c, Name__c FROM Game_Player__c WHERE Id ='${playerId}'`;
        this.sfdc.query(soql, (error, result) => {
            if (error) {
                console.error('isPlayerIdValid', error);
                response.sendStatus(500);
            } else {
                response.json({
                    playerId,
                    isValid: result.records.length === 1,
                    // name: result.records.length > 0 ? result.records[0].Name__c : null,
                    // activity: result.records.length > 0 ? result.records[0].Game__r.Activity__c
                });
            }
        });
    }

    getPlayerLeaderboard(request, response) {
        const { playerId } = request.params;
        if (!playerId) {
            response
                .status(400)
                .json({ message: 'Missing playerId parameter.' });
            return;
        }

        const ns = Configuration.getSfNamespacePrefix();
        const soql = `SELECT ${ns}Score__c, ${ns}Ranking__c FROM ${ns}Quiz_Player__c WHERE Id='${playerId}'`;
        this.sfdc.query(soql, (error, result) => {
            if (error) {
                console.error('getPlayerLeaderboard', error);
                response.sendStatus(500);
            } else if (result.records.length === 0) {
                response.status(404).json({ message: 'Unkown player.' });
            } else {
                const record = result.records[0];
                const leaderboard = {
                    score: record[`${ns}Score__c`],
                    rank: record[`${ns}Ranking__c`]
                };
                response.json(leaderboard);
            }
        });
    }

    getPlayerStats(request, response) {
        const { playerId } = request.params;
        if (!playerId) {
            response
                .status(400)
                .json({ message: 'Missing playerId parameter.' });
            return;
        }

        const ns = Configuration.getSfNamespacePath();
        this.sfdc.apex.get(
            `${ns}/quiz/player/stats?id=${playerId}`,
            (error, result) => {
                if (error) {
                    response.status(500).json({ message: error.message });
                } else {
                    response.send(result);
                }
            }
        );
    }
};
