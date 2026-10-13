import '@testing-library/jest-dom';

// MOCK GLOBAL PARA EVITAR ERRORES DE WINDOW.ALERT EN JSDOM
window.alert = () => {};
window.prompt = () => {};