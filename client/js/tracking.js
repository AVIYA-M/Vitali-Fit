const API_URL_TRACKING =
    'http://localhost:5000/api/tracking';


document.addEventListener('DOMContentLoaded', () => {

    loadTrackingData();

});


async function loadTrackingData() {

    const token =
        localStorage.getItem('token');


    if (!token) {

        window.location.href =
            'login.html';

        return;
    }


    try {

        const response =
            await fetch(
                API_URL_TRACKING,
                {
                    method: 'GET',

                    headers: {
                        'Authorization':
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                'שגיאה בשליפת נתוני המעקב'
            );
        }


        updateTrackingDashboard(data);


    } catch (error) {

        console.error(
            'שגיאה בטעינת נתוני המעקב:',
            error
        );

    }
}


function updateTrackingDashboard(data) {

    const completedWorkouts =
        document.getElementById(
            'completed-workouts'
        );


    const activityTime =
        document.getElementById(
            'activity-time'
        );


    const weeklyCalories =
        document.getElementById(
            'weekly-calories'
        );


    const weeklyWorkouts =
        document.getElementById(
            'weekly-workouts'
        );


    const monthlyCompleted =
        document.getElementById(
            'monthly-completed'
        );


    const monthlyGoal =
        document.getElementById(
            'monthly-goal'
        );


    const monthlyPercentage =
        document.getElementById(
            'monthly-percentage'
        );


    const monthlyProgressBar =
        document.getElementById(
            'monthly-progress-bar'
        );

    const upcomingWorkoutTitle =
        document.getElementById('upcoming-workout-title');

    const upcomingWorkoutDate =
        document.getElementById('upcoming-workout-date');

    const upcomingWorkoutTime =
        document.getElementById('upcoming-workout-time');

    const upcomingWorkoutInstructor =
        document.getElementById('upcoming-workout-instructor');


    // אימונים שהושלמו
    if (completedWorkouts) {

        completedWorkouts.textContent =
            data.completedWorkouts || 0;
    }


    // זמן פעילות
    if (activityTime) {

        const hours =
            (Number(data.activityMinutes) || 0) / 60;

        activityTime.textContent =
            hours.toFixed(1);
    }


    // קלוריות השבוע
    if (weeklyCalories) {

        weeklyCalories.textContent =
            (data.weeklyCalories || 0)
                .toLocaleString();
    }


    // אימונים השבוע
    if (weeklyWorkouts) {

        weeklyWorkouts.textContent =
            data.weeklyWorkouts || 0;
    }


    // התקדמות חודשית
    if (monthlyCompleted) {

        monthlyCompleted.textContent =
            data.monthlyCompleted || 0;
    }


    if (monthlyGoal) {

        monthlyGoal.textContent =
            data.monthlyGoal || 0;
    }


    if (monthlyPercentage) {

        monthlyPercentage.textContent =
            `${Number(data.monthlyPercentage || 0).toFixed(1)}%`;
    }


    if (monthlyProgressBar) {

        monthlyProgressBar.style.width =
            `${Number(data.monthlyPercentage || 0)}%`;
    }


    if (data.upcomingWorkout) {
        if (upcomingWorkoutTitle) {
            upcomingWorkoutTitle.textContent =
                data.upcomingWorkout.title;
        }

        if (upcomingWorkoutDate) {
            const workoutDate =
                new Date(data.upcomingWorkout.date);

            upcomingWorkoutDate.textContent =
                '📅 ' + workoutDate.toLocaleDateString('he-IL');
        }

        if (upcomingWorkoutTime) {
            upcomingWorkoutTime.textContent =
                '🕒 ' + data.upcomingWorkout.time;
        }

        if (upcomingWorkoutInstructor) {
            upcomingWorkoutInstructor.textContent =
                '👤 ' + data.upcomingWorkout.instructor;
        }
    } else {
        if (upcomingWorkoutTitle) {
            upcomingWorkoutTitle.textContent =
                'אין אימונים קרובים';
        }

        if (upcomingWorkoutDate) {
            upcomingWorkoutDate.textContent =
                'עדיין לא נרשמת לאימון עתידי';
        }

        if (upcomingWorkoutTime) {
            upcomingWorkoutTime.textContent = '';
        }

        if (upcomingWorkoutInstructor) {
            upcomingWorkoutInstructor.textContent = '';
        }
    }
}
