// Firebase 초기화
const firebaseConfig = {
    apiKey: "AIzaSyB8EGcxw1VD2OjNmFI7Tj503Bq3jAWzrMA",
    authDomain: "dy-pressto.firebaseapp.com",
    projectId: "dy-pressto",
    appId: "1:576892383114:web:49bd33dfa4d6b08cd06273"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// 현재 로그인 사용자
let currentUser = null;

// 로그인 상태 감지
auth.onAuthStateChanged((user) => {
    currentUser = user;
    updateLoginUI(user);
});

// 구글 로그인
function googleLogin() {
    auth.signInWithPopup(googleProvider).catch((error) => {
        console.error('로그인 실패:', error);
        if (error.code === 'auth/popup-blocked') {
            auth.signInWithRedirect(googleProvider);
        }
    });
}

// 로그아웃
function googleLogout() {
    auth.signOut().catch((error) => {
        console.error('로그아웃 실패:', error);
    });
}

// 로그인 UI 업데이트
function updateLoginUI(user) {
    const loginArea = document.getElementById('login-area');
    const userProfile = document.getElementById('user-profile');
    const userPhoto = document.getElementById('user-photo');

    if (!loginArea || !userProfile) return;

    if (user) {
        loginArea.classList.add('hidden');
        userProfile.classList.remove('hidden');
        if (userPhoto && user.photoURL) {
            userPhoto.src = user.photoURL;
        }
    } else {
        loginArea.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
}

// Firestore에 점수 저장
function saveScore(score, difficulty, level) {
    if (!currentUser) return Promise.resolve();

    return db.collection('scores').add({
        userId: currentUser.uid,
        userName: currentUser.displayName || '익명',
        userPhoto: currentUser.photoURL || '',
        score: score,
        difficulty: difficulty,
        level: level,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch((error) => {
        console.error('점수 저장 실패:', error);
    });
}

// 랭킹 조회
function fetchRanking(difficulty, period) {
    let query;

    if (period === 'weekly' || period === 'monthly') {
        // 기간 필터: range 필터(timestamp) → 해당 필드로 먼저 orderBy 필수
        const cutoff = new Date();
        if (period === 'weekly') {
            cutoff.setDate(cutoff.getDate() - 7);
        } else {
            cutoff.setMonth(cutoff.getMonth() - 1);
        }
        query = db.collection('scores')
            .where('difficulty', '==', difficulty)
            .where('timestamp', '>=', cutoff)
            .orderBy('timestamp', 'desc')
            .limit(100);
    } else {
        // 역대: equality + orderBy score
        query = db.collection('scores')
            .where('difficulty', '==', difficulty)
            .orderBy('score', 'desc')
            .limit(50);
    }

    return query.get().then((snapshot) => {
        const scores = [];
        snapshot.forEach((doc) => {
            scores.push({ id: doc.id, ...doc.data() });
        });
        // 주간/월간은 timestamp순으로 가져온 뒤 score순 재정렬
        if (period === 'weekly' || period === 'monthly') {
            scores.sort((a, b) => b.score - a.score);
            return scores.slice(0, 50);
        }
        return scores;
    }).catch((error) => {
        console.error('랭킹 조회 실패:', error);
        return [];
    });
}

// 랭킹 목록 렌더링
function renderRanking(scores) {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;

    if (scores.length === 0) {
        rankingList.innerHTML = '<p class="ranking-empty">아직 기록이 없습니다</p>';
        return;
    }

    let html = '';
    scores.forEach((entry, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
        const isMe = currentUser && entry.userId === currentUser.uid;
        const photoHtml = entry.userPhoto
            ? `<img class="rank-photo" src="${entry.userPhoto}" alt="">`
            : '<div class="rank-photo rank-photo-default">?</div>';

        html += `<div class="rank-row${isMe ? ' rank-me' : ''}">
            <span class="rank-num">${medal}</span>
            ${photoHtml}
            <span class="rank-name">${escapeHtml(entry.userName)}</span>
            <span class="rank-score">${entry.score}</span>
        </div>`;
    });

    rankingList.innerHTML = html;

    // 내 순위로 자동 스크롤
    const myRow = rankingList.querySelector('.rank-me');
    if (myRow) {
        setTimeout(() => {
            myRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
