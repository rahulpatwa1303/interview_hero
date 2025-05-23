// convert-figma-colors.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper function to convert HEX to HSL string (H S% L%)
function hexToHslString(hex) {
    if (!hex) return null;
    let r = 0, g = 0, b = 0;

    // Remove # and handle potential alpha
    hex = hex.replace('#', '');
    if (hex.length === 8) hex = hex.substring(0, 6); // Remove alpha
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]; // Expand shorthand

    if (hex.length !== 6) {
        console.warn(`Invalid HEX color for HSL conversion: ${hex}`);
        return `INVALID_HEX: ${hex}`; // Or return null or throw error
    }

    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);

    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
        ? l === r
            ? (g - b) / s
            : l === g
                ? 2 + (b - r) / s
                : 4 + (r - g) / s
        : 0;

    const hue = Math.round(60 * h < 0 ? 60 * h + 360 : 60 * h);
    const saturation = Math.round(100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0));
    const lightness = Math.round((100 * (2 * l - s)) / 2);

    return `${hue} ${saturation}% ${lightness}%`;
}


// Main function to process the tokens
async function processTokens(inputFile, outputFile) {
    try {
        const rawData = await fs.readFile(inputFile, 'utf-8');
        const tokens = JSON.parse(rawData);

        const lightThemeColors = {};
        const darkThemeColors = {};

        // Process color.semantic for Light Theme
        if (tokens.color && tokens.color.semantic) {
            for (const key in tokens.color.semantic) {
                if (tokens.color.semantic[key].type === 'color' && tokens.color.semantic[key].value) {
                    lightThemeColors[key] = hexToHslString(tokens.color.semantic[key].value);
                }
            }
        } else {
            console.warn("Warning: 'color.semantic' section not found in input JSON.");
        }

        // Process theme.semantic and theme.scale for Dark Theme
        if (tokens.theme && tokens.theme.semantic && tokens.theme.scale) {
            for (const key in tokens.theme.semantic) {
                const themeValue = tokens.theme.semantic[key].value;
                if (tokens.theme.semantic[key].type === 'color') {
                    if (typeof themeValue === 'string' && themeValue.startsWith('{theme.scale.')) {
                        // It's an alias, e.g., "{theme.scale.surface 0}"
                        const scalePath = themeValue.replace('{theme.scale.', '').replace('}', '').trim();
                        const scaleColorObject = tokens.theme.scale[scalePath];
                        if (scaleColorObject && scaleColorObject.type === 'color' && scaleColorObject.value) {
                            darkThemeColors[key] = hexToHslString(scaleColorObject.value);
                        } else {
                            console.warn(`Dark theme alias ${themeValue} for key '${key}' could not be resolved in theme.scale or is not a color.`);
                            darkThemeColors[key] = `UNRESOLVED_ALIAS: ${themeValue}`;
                        }
                    } else if (typeof themeValue === 'string' && themeValue.startsWith('#')) {
                        // It's a direct HEX value in theme.semantic
                        darkThemeColors[key] = hexToHslString(themeValue);
                    } else {
                         console.warn(`Dark theme value for key '${key}' is not a recognized alias or HEX value: ${themeValue}`);
                         darkThemeColors[key] = `INVALID_VALUE: ${themeValue}`;
                    }
                }
            }
        } else {
            console.warn("Warning: 'theme.semantic' or 'theme.scale' section not found in input JSON. Dark theme colors may be incomplete.");
        }

        const outputJson = {
            lightTheme: lightThemeColors,
            darkTheme: darkThemeColors,
        };

        await fs.writeFile(outputFile, JSON.stringify(outputJson, null, 2));
        console.log(`Successfully processed colors and saved to ${outputFile}`);

    } catch (error) {
        console.error("Error processing token file:", error);
    }
}

// Determine __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'design-tokens.tokens.json'); // Assumes input is in same dir
const outputFile = path.join(__dirname, 'processed-colors.json');

processTokens(inputFile, outputFile);