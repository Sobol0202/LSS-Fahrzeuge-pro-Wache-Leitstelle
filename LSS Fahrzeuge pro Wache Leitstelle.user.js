// ==UserScript==
// @name         LSS Fahrzeuge pro Wache Leitstelle
// @namespace    www.leitstellenspiel.de
// @version      1.1
// @description  Fügt die Anzahl der Fahrzeuge hinter die Ausbaustufe ein
// @author       MissSobol
// @match        https://www.leitstellenspiel.de/buildings/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //console.log("Tampermonkey-Skript gestartet.");

    // Funktion zum Abrufen der Fahrzeugdaten
    async function fetchVehicles() {
        //console.log("Abrufen der Fahrzeugdaten...");
        const response = await fetch('https://www.leitstellenspiel.de/api/vehicles');
        const data = await response.json();
        //console.log("Fahrzeugdaten abgerufen:", data);
        return data;
    }

    // Funktion zum Einfügen der Fahrzeuganzahl
    function insertVehicleCounts(vehicles) {
        //console.log("Einfügen der Fahrzeuganzahl...");
        const buildingTable = document.getElementById('building_table');
        if (!buildingTable) {
            //console.log("Tabelle mit ID 'building_table' nicht gefunden.");
            return;
        }

        //console.log("Tabelle mit ID 'building_table' gefunden.");
        const rows = buildingTable.getElementsByTagName('tr');
        for (const row of rows) {
            const buildingLink = row.querySelector('td:nth-child(2) a');
            const upgradeCell = row.querySelector('td:nth-child(3)');
            if (buildingLink && upgradeCell) {
                const buildingId = buildingLink.href.split('/').pop();
                const vehicleCount = vehicles.filter(vehicle => vehicle.building_id === parseInt(buildingId)).length;
                //console.log(`Gebäude-ID: ${buildingId}, Fahrzeuganzahl: ${vehicleCount}`);
                upgradeCell.textContent += ` (${vehicleCount})`;
            } else {
                //console.log("Kein gültiger Gebäudelink oder Ausbaustufe gefunden in Zeile:", row);
            }
        }
    }

    // Funktion zum Initialisieren des Observers
    function initObserver() {
        const observer = new MutationObserver((mutations) => {
            //console.log("Mutations erkannt:", mutations);
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            //console.log("Hinzugefügter Knoten:", node);
                            if (node.id === 'building_table' || node.querySelector('#building_table')) {
                                //console.log("Tabelle mit ID 'building_table' wurde geladen.");
                                fetchVehicles().then(insertVehicleCounts);
                                observer.disconnect();
                                return;
                            }
                        }
                    }
                }
            }
        });

        const tabContent = document.querySelector('.tab-content');
        if (tabContent) {
            observer.observe(tabContent, { childList: true, subtree: true });
            //console.log("Observer für Änderungen in '.tab-content' gestartet.");
        } else {
            //console.log("Element mit der Klasse 'tab-content' nicht gefunden.");
        }
    }

    // Starte den Observer
    initObserver();

})();
