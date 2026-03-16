/**
 * Represents a player in the game.
 * @class
 * 
 * @param {Object} params - Player parameters.
 * @param {string|number} params.id - Unique identifier for the player.
 * @param {string} params.name - Name of the player.
 * @param {string} params.color - Color associated with the player.
 */
 
export default class Player {
	constructor({ id, name, color }) {
		this.id = id;
		this.name = name;
		this.color = color;
		this.troops = 0;
	}
	
	/**
	 * Sets the number of troops for the player.
	 * @param {number} amount - The number of troops to set. Must be >= 0.
	 */
	setTroops(amount) {
		this.troops = Math.max(0, amount);
	}
	
	
   /**W
	* Adds troops to the player's current troop count.
	* @param {number} amount - The number of troops to add. Must be >= 0.
	*/
	
	addTroops(amount) {
		this.troops += Math.max(0, amount);	
	}
	
	/**
	 * Spends one troop if available.
	 * @returns {boolean} True if a troop was spent, false otherwise.
	 */
	spendTroop() {
		if (this.troops <= 0) return false;
		this.troops -= 1;
		return true;
	}
}

/**
 * Generates an array of mock player records for testing or development purposes.
 *
 * @param {number} count - The number of mock player records to generate.
 * @returns {Array<Object>} An array of player record objects, each containing an `id`, `name`, and `color`.
 *
 * The `name` property uses the double question mark (`??`) operator to provide a fallback value.
 * If `PLAYER_NAMES_DEFAULT[index]` is `undefined` or `null`, it defaults to `"Player ${index + 1}"`.
 *
 * @returns {Array<Object>} An array of mock player objects, each containing `id`, `name`, and `color` properties.
 */
export function createMockPlayers(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `mock-player-${index + 1}`,
    name: PLAYER_NAMES_DEFAULT[index] ?? `Player ${index + 1}`,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
  }));
}

export const MAX_PLAYERS = 4;
export const PLAYER_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c"];
export const PLAYER_NAMES_DEFAULT = ["Rojo", "Azul", "Verde", "Naranja", "Morado", "Verde"];	