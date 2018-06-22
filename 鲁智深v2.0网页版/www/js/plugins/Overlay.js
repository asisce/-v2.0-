//=============================================================================
// Overlay.js
//=============================================================================
/*:
 * @plugindesc Overlay Mapping script by SWEBOK v1.1
 * @author SWEBOK
 *
 * @param Light Switch
 * @desc Turn on/off light layer
 * @default 1
 *
 * @param Parallax Switch
 * @desc Turn on/off parallax layer
 * @default 2
 *
 * @param Ground Switch
 * @desc Turn on/off ground layer
 * @default 3
 *
 * @param Light Variable
 * @desc Switch to another light
 * @default 1
 *
 * @param Parallax Variable
 * @desc Switch to another parallax
 * @default 2
 *
 * @param Ground Variable
 * @desc Switch to another ground
 * @default 3
 *
 * @help This plugin does not provide plugin commands.
 *
 * Last Updated: 10/27/2015
 *     v1.0 - 10/24/2015 - first release.
 *     v1.1 - 10/27/2015 - upper tilemap layer problem solved
 *
 * This script will automatically load map's overlay by map ID, and a map can have more than
 * one image per layer, so you don't have to create two or more map just for day/night or
 * when an event occur.
 *
 * Create a folder in img and name it overlay.
 * Put all of your overlay into img/overlay.
 * Your overlay file will have the name: "ground"/"par"/"light" + Map-ID + "-" + Number.
 * Map-ID is your map's ID.
 * Number is 1, 2, 3, ... using for Overlay Variables.
 *
 * Example: img/overlay/ground2-1.png
 * 
 * All pictures must be .png
 */
 
 (function() {
	var parameters = PluginManager.parameters('Overlay');
	var lightSwitch = Number(parameters['Light Switch'] || 1);
	var parallaxSwitch = Number(parameters['Parallax Switch'] || 2);
	var groundSwitch = Number(parameters['Ground Switch'] || 3);
	var lightVariable = Number(parameters['Light Variable'] || 1);
	var parallaxVariable = Number(parameters['Parallax Variable'] || 2);
	var groundVariable = Number(parameters['Ground Variable'] || 3);
 
	ImageManager.loadOverlay = function(filename, hue) {
		return this.loadBitmap('img/overlay/', filename, hue, false);
	};
	
	ImageManager.isReady = function() {
		for (var key in this._cache) {
			var bitmap = this._cache[key];
			if (bitmap.isError()) {
				//throw new Error('Failed to load: ' + bitmap.url);
				bitmap = new Bitmap();
				return true;
			}
			if (!bitmap.isReady()) {
				return false;
			}
		}
		return true;
	};

	Spriteset_Map.prototype.createLowerLayer = function() {
		Spriteset_Base.prototype.createLowerLayer.call(this);
		this.createParallax();
		this.createTilemap();
		this.createOverlayGround();
		this.createCharacters();
		this.createOverlayParallax();
		this.createShadow();
		this.createOverlayLight();
		this.createDestination();
		this.createWeather();
	};
	
	Spriteset_Map.prototype.update = function() {
		Spriteset_Base.prototype.update.call(this);
		this.updateTileset();
		this.updateParallax();
		this.updateTilemap();
		this.updateOverlayGround();
		this.updateOverlayParallax();
		this.updateShadow();
		this.updateOverlayLight();
		this.updateWeather();
	};
	
	Spriteset_Map.prototype.createOverlayGround = function() {
		this._overlayGround = new TilingSprite();
		this._overlayGround.move(0, 0, Graphics.width, Graphics.height);
		this._tilemap._lowerLayer.addChild(this._overlayGround);
	};
	
	Spriteset_Map.prototype.createCharacters = function() {
		this._characterSprites = [];
		$gameMap.events().forEach(function(event) {
			this._characterSprites.push(new Sprite_Character(event));
		}, this);
		$gameMap.vehicles().forEach(function(vehicle) {
			this._characterSprites.push(new Sprite_Character(vehicle));
		}, this);
		$gamePlayer.followers().reverseEach(function(follower) {
			this._characterSprites.push(new Sprite_Character(follower));
		}, this);
		this._characterSprites.push(new Sprite_Character($gamePlayer));
		for (var i = 0; i < this._characterSprites.length; i++) {
			this._tilemap.addChild(this._characterSprites[i]);
		}
	};
	
	Spriteset_Map.prototype.createOverlayParallax = function() {
		this._overlayParallax = new TilingSprite();
		this._overlayParallax.move(0, 0, Graphics.width, Graphics.height);
		this._baseSprite.addChild(this._overlayParallax);
	};
	
	Spriteset_Map.prototype.createOverlayLight = function() {
		this._overlayLight = new TilingSprite();
		this._overlayLight.move(0, 0, Graphics.width, Graphics.height);
		this._baseSprite.addChild(this._overlayLight);
	};
	
	Spriteset_Map.prototype.updateOverlayGround = function() {
		var gndSwitch = $gameSwitches.value(groundSwitch);
		if (gndSwitch) {
			var groundIndex = $gameVariables.value(groundVariable);
			if (this._overlayGroundName !== 'ground' + $gameMap.mapId() + '-' + groundIndex) {
				this._overlayGroundName = 'ground' + $gameMap.mapId() + '-' + groundIndex;
				this._overlayGround.bitmap = ImageManager.loadOverlay(this._overlayGroundName);
			}
			if (this._overlayGround.bitmap) {
				this._overlayGround.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
				this._overlayGround.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
			}
		}
		else {
			if (this._overlayGroundName !== '') {
				this._overlayGroundName = '';
				this._overlayGround.bitmap = ImageManager.loadEmptyBitmap();
			}
		}
	};
	
	Spriteset_Map.prototype.updateOverlayParallax = function() {
		var parSwitch = $gameSwitches.value(parallaxSwitch);
		if (parSwitch) {
			var parIndex = $gameVariables.value(parallaxVariable);
			if (this._overlayParallaxName !== 'par' + $gameMap.mapId() + '-' + parIndex) {
				this._overlayParallaxName = 'par' + $gameMap.mapId() + '-' + parIndex;
				this._overlayParallax.bitmap = ImageManager.loadOverlay(this._overlayParallaxName);
			}
			if (this._overlayParallax.bitmap) {
				this._overlayParallax.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
				this._overlayParallax.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
			}
		}
		else {
			if (this._overlayParallaxName !== '') {
				this._overlayParallaxName = '';
				this._overlayParallax.bitmap = ImageManager.loadEmptyBitmap();
			}
		}
	};
	
	Spriteset_Map.prototype.updateOverlayLight = function() {
		var liSwitch = $gameSwitches.value(lightSwitch);
		if (liSwitch) {
			var lightIndex = $gameVariables.value(lightVariable);
			if (this._overlayLightName !== 'light' + $gameMap.mapId() + '-' + lightIndex) {
				this._overlayLightName = 'light' + $gameMap.mapId() + '-' + lightIndex;
				this._overlayLight.bitmap = ImageManager.loadOverlay(this._overlayLightName);
			}
			if (this._overlayLight.bitmap) {
				this._overlayLight.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
				this._overlayLight.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
			}
		}
		else {
			if (this._overlayLightName !== '') {
				this._overlayLightName = '';
				this._overlayLight.bitmap = ImageManager.loadEmptyBitmap();
			}
		}
	};
 })();