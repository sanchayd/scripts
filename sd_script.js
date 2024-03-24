// ==UserScript==
// @name Sorare Lineup Predictions
// @namespace http://tampermonkey.net/
// @version 1.0
// @description Automates lineup predictions based on the player's previous game status
// @author Your Name
// @match https://www.soraredata.com/SO5Results/sections/community-lineups
// @grant none
// ==/UserScript==

(function() {
    'use strict';

    // Function to wait for an element to be present in the DOM
    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            setTimeout(function() {
                waitForElement(selector, callback);
            }, 100);
        }
    }

    // Function to get the player's last game status
    function getLastGameStatus(playerRow) {
        // Find the div containing the last game status within the player row
        const lastGameDiv = playerRow.querySelector('td:nth-child(3) > div > div:last-child > div');
        if (lastGameDiv) {
            // Find the image within the last game div
            const lastGameStatusImg = lastGameDiv.querySelector('img');
            if (lastGameStatusImg) {
                // Get the source attribute of the image
                const lastGameStatusSrc = lastGameStatusImg.getAttribute('src');
                // Check the source attribute to determine the last game status
                if (lastGameStatusSrc.includes('starter')) {
                    return 'starter';
                } else if (lastGameStatusSrc.includes('doubtful')) {
                    return 'doubtful';
                } else if (lastGameStatusSrc.includes('benchNotCameIn')) {
                    return 'benchNotCameIn';
                } else if (lastGameStatusSrc.includes('notInSquad')) {
                    return 'notInSquad';
                }
            }
        }
        // If the last game status cannot be determined, return 'unknown'
        return 'unknown';
    }

    // Function to set the prediction based on the last game status
    function setPrediction(playerRow, lastGameStatus) {
        // Find the div containing the prediction images within the player row
        const predictionDiv = playerRow.querySelector('td:last-child > div > div');
        if (predictionDiv) {
            // Get all the prediction images within the prediction div
            const predictionImgs = predictionDiv.querySelectorAll('img');
            if (predictionImgs.length === 4) {
                // Iterate over each prediction image
                predictionImgs.forEach(img => {
                    // Check if the prediction image matches the last game status
                    if (img.getAttribute('src').includes(lastGameStatus)) {
                        // If it matches, remove the 'opacity-40' class and add the 'cursor-pointer' class
                        img.parentElement.classList.remove('opacity-40');
                        img.parentElement.classList.add('cursor-pointer');
                    } else {
                        // If it doesn't match, add the 'opacity-40' class and remove the 'cursor-pointer' class
                        img.parentElement.classList.add('opacity-40');
                        img.parentElement.classList.remove('cursor-pointer');
                    }
                });
            }
        }
    }

    // Wait for the page to load before running the script
    window.addEventListener('load', function() {
        console.log('Page loaded');

        // Assumption: It takes approximately 15 seconds for the players to load after clicking the "My Players" tab
        // Condition: Wait for 15 seconds before proceeding
        setTimeout(function() {
            console.log('Waiting for players to load...');

            // Assumption: The player rows are contained within a <tbody> element
            // Condition: Wait for the <tbody> element to be present in the DOM
            waitForElement('tbody', function(tbody) {
                const playerRows = tbody.querySelectorAll('tr');
                console.log('Number of player rows found:', playerRows.length);

                playerRows.forEach((playerRow, index) => {
                    console.log(`Processing player row ${index + 1}`);

                    // Check if the row contains player-specific elements
                    const playerNameElement = playerRow.querySelector('td:first-child p.font-medium');
                    const playerPositionElement = playerRow.querySelector('td:first-child p:not(.font-medium)');

                    if (playerNameElement && playerPositionElement) {
                        // Extract player name and position
                        const playerName = playerNameElement.textContent.trim();
                        const playerPosition = playerPositionElement.textContent.trim();

                        console.log('Player name:', playerName);
                        console.log('Player position:', playerPosition);

                        // Get the player's last 5 games statuses
                        const lastFiveGamesStatuses = [];
                        const lastFiveGamesDivs = playerRow.querySelectorAll('td:nth-child(3) > div > div');
                        lastFiveGamesDivs.forEach(gameDiv => {
                            const gameStatusImg = gameDiv.querySelector('img');
                            if (gameStatusImg) {
                                const gameStatusSrc = gameStatusImg.getAttribute('src');
                                if (gameStatusSrc.includes('starter')) {
                                    lastFiveGamesStatuses.push('starter');
                                } else if (gameStatusSrc.includes('doubtful')) {
                                    lastFiveGamesStatuses.push('doubtful');
                                } else if (gameStatusSrc.includes('benchNotCameIn')) {
                                    lastFiveGamesStatuses.push('benchNotCameIn');
                                } else if (gameStatusSrc.includes('notInSquad')) {
                                    lastFiveGamesStatuses.push('notInSquad');
                                } else {
                                    lastFiveGamesStatuses.push('unknown');
                                }
                            } else {
                                lastFiveGamesStatuses.push('unknown');
                            }
                        });
                        console.log('Last 5 games statuses:', lastFiveGamesStatuses);

                        // Get the player's last 5 scores
                        const lastFiveScores = [];
                        const lastFiveScoresDivs = playerRow.querySelectorAll('td:nth-child(4) > div > div');
                        lastFiveScoresDivs.forEach(scoreDiv => {
                            const scoreElement = scoreDiv.querySelector('p');
                            if (scoreElement) {
                                const score = scoreElement.textContent.trim();
                                lastFiveScores.push(score);
                            } else {
                                lastFiveScores.push('N/A');
                            }
                        });
                        console.log('Last 5 scores:', lastFiveScores);

                        // Get the player's last game status
                        const lastGameStatus = getLastGameStatus(playerRow);
                        console.log('Last game status:', lastGameStatus);

                        // Set the prediction based on the last game status
                        setPrediction(playerRow, lastGameStatus);

                        console.log('---');
                    } else {
                        console.log('Skipping non-player row');
                        console.log('Row content:', playerRow.innerHTML);
                        console.log('---');
                    }
                });
            });
        }, 15000); // Adjust the delay (in milliseconds) based on the actual loading time
    });
})();