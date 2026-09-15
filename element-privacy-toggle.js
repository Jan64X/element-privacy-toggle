// ==UserScript==
// @name         Element privacy toggle
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Hide messages unless you hover over them
// @author       m4rt1n99
// @match        https://app.element.io/*
// @license      MIT
// ==/UserScript==
 
(() => {
    'use strict';
 
    const eyeSVG = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="24" height="24" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    `;
 
    const eyeClosedSVG = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="24" height="24" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
            <path d="m2 2 20 20"/>
        </svg>
    `;
 
    const style = document.createElement('style');
    style.textContent = `
        html.tm-privacy-enabled .mx_EventTile {
            filter: blur(4px);
        }
 
        html.tm-privacy-enabled .mx_EventTile:hover {
            filter: none;
        }
 
        #tm-privacy-button {
            display: grid;
            place-items: center;
            width: 32px;
            height: 32px;
            padding: 4px;
            border: 0;
            border-radius: 8px;
            background: transparent;
            cursor: pointer;
            color: var(--cpd-color-gray-900);
        }
 
        #tm-privacy-button:hover {
            background: rgba(127, 127, 127, 0.15);
        }
    `;
    document.head.append(style);
 
    let privacyButton = null;
 
    function addButton() {
        if (privacyButton?.isConnected) {
            return;
        }
 
        privacyButton = document.getElementById('tm-privacy-button');
        if (privacyButton) {
            return;
        }
 
        const header = document.querySelector('.mx_RoomHeader');
 
        if (!header) {
            return;
        }
 
        const button = document.createElement('button');
        button.id = 'tm-privacy-button';
        button.type = 'button';
        button.title = 'Blur messages';
        button.setAttribute('aria-label', 'Blur messages');
        button.innerHTML = eyeSVG;
 
        const cookieHidden = document.cookie.match(/(?:^|;\s*)messages_hidden=([^;]*)/)?.[1] === 'true';
        console.log(cookieHidden);
        button.innerHTML = cookieHidden ? eyeClosedSVG : eyeSVG;
        button.title = cookieHidden ? 'Show messages' : 'Blur messages';
        button.setAttribute(
           'aria-label',
            cookieHidden ? 'Show messages' : 'Blur messages'
        );
        document.documentElement.classList.toggle('tm-privacy-enabled', cookieHidden);
 
        button.addEventListener('click', () => {
            const blurred =
                document.documentElement.classList.toggle('tm-privacy-enabled');
 
 
            document.cookie = `messages_hidden=${blurred}; max-age=86400; path=/; secure`;
            button.innerHTML = blurred ? eyeClosedSVG : eyeSVG;
            button.title = blurred ? 'Show messages' : 'Blur messages';
            button.setAttribute(
                'aria-label',
                blurred ? 'Show messages' : 'Blur messages'
            );
        });
 
        privacyButton = button;
        header.append(button);
    }
 
    const observer = new MutationObserver(() => {
        // Ignore ordinary mutations while the existing button is still attached.
        if (!privacyButton?.isConnected) {
            addButton();
        }
    });
 
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
 
    addButton();
 
})(); 
