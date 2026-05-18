// engine/gameMusic.js - 音频系统（背景音乐控制）
// 停止音乐时记录播放位置，下次播放同种音乐时从该位置继续
// 每次新播放音乐时，头2秒渐强效果（从30%音量到目标音量）
import { app } from './gameState.js';

// 渐强效果：从 30% 目标音量到 100% 目标音量，持续 2 秒
function applyFadeIn(audio, targetVolume) {
    const startVolume = targetVolume * 0.3;
    const duration = 2000; // 2秒
    const startTime = Date.now();
    
    audio.volume = startVolume;
    
    function step() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // 从 startVolume 线性过渡到 targetVolume
        audio.volume = startVolume + (targetVolume - startVolume) * progress;
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

// 停止所有背景音乐（确保同一时间只有一个音频播放）
function stopAllMusic() {
    stopCityMusic();
    stopFightMusic();
    stopStoryMusic();
    app.currentMusicType = null;
}

// 主城背景音乐控制
export function playCityMusic() {
    // 如果当前已经在播放主城音乐，不重复播放
    if (app.currentMusicType === 'city') return;
    try {
        // 停止其他音乐
        if (app.currentMusicType === 'fight') stopFightMusic();
        else if (app.currentMusicType === 'story') stopStoryMusic();
        
        if (!app.cityMusic) {
            app.cityMusic = new Audio('music/city1.mp3');
            app.cityMusic.loop = true;
            app.cityMusic.volume = 0.25;
        }
        if (app.cityMusic.paused) {
            // 从上次停止的位置继续播放（不重置 currentTime）
            app.cityMusic.play().catch(e => console.warn('主城音乐播放失败:', e));
            // 每次新播放时应用渐强效果
            applyFadeIn(app.cityMusic, 0.25);
        }
        app.currentMusicType = 'city';
    } catch (e) {
        console.warn('主城音乐初始化失败:', e);
    }
}

export function stopCityMusic() {
    try {
        if (app.cityMusic && !app.cityMusic.paused) {
            app.cityMusic.pause();
            // 不重置 currentTime，保留播放位置
        }
    } catch (e) {
        console.warn('停止主城音乐失败:', e);
    }
}

// 战斗副本背景音乐控制
export function playFightMusic() {
    // 如果当前已经在播放战斗音乐，不重复播放
    if (app.currentMusicType === 'fight') return;
    try {
        // 停止其他音乐
        if (app.currentMusicType === 'city') stopCityMusic();
        else if (app.currentMusicType === 'story') stopStoryMusic();
        
        if (!app.fightMusic) {
            app.fightMusic = new Audio('music/fight1.mp3');
            app.fightMusic.loop = true;
            app.fightMusic.volume = 0.25;
        }
        if (app.fightMusic.paused) {
            // 从上次停止的位置继续播放（不重置 currentTime）
            app.fightMusic.play().catch(e => console.warn('战斗音乐播放失败:', e));
            // 每次新播放时应用渐强效果
            applyFadeIn(app.fightMusic, 0.25);
        }
        app.currentMusicType = 'fight';
    } catch (e) {
        console.warn('战斗音乐初始化失败:', e);
    }
}

export function stopFightMusic() {
    try {
        if (app.fightMusic && !app.fightMusic.paused) {
            app.fightMusic.pause();
            // 不重置 currentTime，保留播放位置
        }
    } catch (e) {
        console.warn('停止战斗音乐失败:', e);
    }
}

// 剧情对话背景音乐控制
function playStoryMusic() {
    // 如果当前已经在播放剧情音乐，不重复播放
    if (app.currentMusicType === 'story') return;
    try {
        // 停止其他音乐
        if (app.currentMusicType === 'city') stopCityMusic();
        else if (app.currentMusicType === 'fight') stopFightMusic();
        
        if (!app.storyMusic) {
            app.storyMusic = new Audio('music/story1.mp3');
            app.storyMusic.loop = true;
            app.storyMusic.volume = 0.5;
        }
        if (app.storyMusic.paused) {
            // 从上次停止的位置继续播放（不重置 currentTime）
            app.storyMusic.play().catch(e => console.warn('剧情音乐播放失败:', e));
            // 每次新播放时应用渐强效果
            applyFadeIn(app.storyMusic, 0.5);
        }
        app.currentMusicType = 'story';
    } catch (e) {
        console.warn('剧情音乐初始化失败:', e);
    }
}

function stopStoryMusic() {
    try {
        if (app.storyMusic && !app.storyMusic.paused) {
            app.storyMusic.pause();
            // 不重置 currentTime，保留播放位置
        }
    } catch (e) {
        console.warn('停止剧情音乐失败:', e);
    }
}

// 记录剧情开始前正在播放的音乐类型，用于结束后恢复
let _bgBeforeStory = null; // 'city' | 'fight' | null

/**
 * 开始剧情对话前的音乐处理（保存当前音乐状态，播放剧情音乐）
 */
export function startStoryMusicTransition() {
    // 如果已经在播放剧情音乐，不需要切换
    if (app.currentMusicType === 'story') return;
    
    if (app.currentMusicType === 'city') {
        _bgBeforeStory = 'city';
        stopCityMusic();
    } else if (app.currentMusicType === 'fight') {
        _bgBeforeStory = 'fight';
        stopFightMusic();
    } else {
        _bgBeforeStory = null;
    }
    playStoryMusic();
}

/**
 * 结束剧情对话后的音乐处理（停止剧情音乐，恢复之前的背景音乐）
 */
export function endStoryMusicTransition(onComplete) {
    stopStoryMusic();
    app.currentMusicType = null;
    if (_bgBeforeStory === 'city') {
        playCityMusic();
    } else if (_bgBeforeStory === 'fight') {
        playFightMusic();
    }
    _bgBeforeStory = null;
    if (onComplete) onComplete();
}
 