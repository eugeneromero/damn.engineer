/**
 * Workout Program Data
 * Structure:
 * - Phases -> Weeks -> Days -> Exercises
 */

window.workoutProgram = {
  phases: [
    {
      id: 1,
      name: "Foundation",
      duration: "Weeks 1–4",
      goal: "Joint prep, light strength, aerobic base",
      weeks: [1, 2, 3, 4],
      schedule: {
        mon: {
          type: "Strength",
          focus: "Legs + Core Focus",
          exercises: [
            { name: "Leg Press", sets: "3×12", weight: "-" },
            { name: "Lat Pulldown", sets: "3×10", weight: "-" },
            { name: "Chest Press (multi-press)", sets: "3×10", weight: "-" },
            { name: "Leg Curl", sets: "3×12", weight: "-" },
            { name: "Cable Pallof Press", sets: "3×10 each side", weight: "-" },
            { name: "Back Extension or Cable RDL", sets: "3×10", weight: "-" }
          ],
          note: "Light, controlled, no pushing to failure."
        },
        tue: {
          type: "Cardio",
          focus: "Endurance",
          variations: [
            {
              weeks: [1, 2],
              options: [
                "Treadmill walk: 30 min at incline 2–4%",
                "Static bike: 20–30 min moderate pace"
              ]
            },
            {
              weeks: [3, 4],
              options: [
                "Intervals: 2 min brisk walk / 1 min slow × 10 (30 min total)",
                "Rowing machine: 1 min moderate / 1 min easy × 12"
              ]
            }
          ]
        },
        wed: { type: "Rest", focus: "Recovery" },
        thu: {
          type: "Strength",
          focus: "Legs + Core Focus",
          exercises: [
            { name: "Leg Press", sets: "3×12", weight: "-" },
            { name: "Lat Pulldown", sets: "3×10", weight: "-" },
            { name: "Chest Press (multi-press)", sets: "3×10", weight: "-" },
            { name: "Leg Curl", sets: "3×12", weight: "-" },
            { name: "Cable Pallof Press", sets: "3×10 each side", weight: "-" },
            { name: "Back Extension or Cable RDL", sets: "3×10", weight: "-" }
          ],
          note: "Light, controlled, no pushing to failure."
        },
        fri: {
          type: "Cardio",
          focus: "Endurance",
          variations: [
            {
              weeks: [1, 2],
              options: [
                "Treadmill walk: 30 min at incline 2–4%",
                "Static bike: 20–30 min moderate pace"
              ]
            },
            {
              weeks: [3, 4],
              options: [
                "Intervals: 2 min brisk walk / 1 min slow × 10 (30 min total)",
                "Rowing machine: 1 min moderate / 1 min easy × 12"
              ]
            }
          ]
        },
        sat: {
          type: "Optional",
          focus: "Active Recovery",
          options: [
            "15–20 min relaxed static bike",
            "Light dribbling or ball touches"
          ]
        },
        sun: { type: "Rest", focus: "Recovery" }
      }
    },
    {
      id: 2,
      name: "Build Up",
      duration: "Weeks 5–8",
      goal: "Increase intensity, introduce jogging, add compound lifts",
      weeks: [5, 6, 7, 8],
      schedule: {
        mon: {
          type: "Strength",
          focus: "Barbell + Machines Combo",
          exercises: [
            { name: "Barbell Squat", sets: "3×5–8", weight: "light–moderate" },
            { name: "Leg Press", sets: "3×10", weight: "-" },
            { name: "Lat Low Row (combo)", sets: "3×10", weight: "-" },
            { name: "Multi-Press Chest Press", sets: "3×8–10", weight: "-" },
            { name: "Rear Delt Fly Machine", sets: "3×12", weight: "-" },
            { name: "Cable Woodchoppers", sets: "3×12 each side", weight: "-" }
          ]
        },
        tue: {
          type: "Cardio",
          focus: "Jog–Walk Intervals",
          description: "Warm-up: 5 min walk. Cool down: 5 min.",
          progression: {
            5: "1 min jog / 2 min walk × 8–10",
            6: "1.5 min jog / 2 min walk × 8–10",
            7: "2 min jog / 2 min walk × 8–10",
            8: "2.5 min jog / 2 min walk × 8–10"
          },
          alternatives: [
            "Rowing: 45 sec moderate / 75 sec easy × 12"
          ]
        },
        wed: { type: "Rest", focus: "Recovery" },
        thu: {
          type: "Strength",
          focus: "Barbell + Machines Combo",
          exercises: [
            { name: "Barbell Squat", sets: "3×5–8", weight: "light–moderate" },
            { name: "Leg Press", sets: "3×10", weight: "-" },
            { name: "Lat Low Row (combo)", sets: "3×10", weight: "-" },
            { name: "Multi-Press Chest Press", sets: "3×8–10", weight: "-" },
            { name: "Rear Delt Fly Machine", sets: "3×12", weight: "-" },
            { name: "Cable Woodchoppers", sets: "3×12 each side", weight: "-" }
          ]
        },
        fri: {
          type: "Cardio",
          focus: "Jog–Walk Intervals",
          description: "Warm-up: 5 min walk. Cool down: 5 min.",
          progression: {
            5: "1 min jog / 2 min walk × 8–10",
            6: "1.5 min jog / 2 min walk × 8–10",
            7: "2 min jog / 2 min walk × 8–10",
            8: "2.5 min jog / 2 min walk × 8–10"
          },
          alternatives: [
            "Rowing: 45 sec moderate / 75 sec easy × 12"
          ]
        },
        sat: {
          type: "Optional",
          focus: "Active Recovery",
          options: [
            "25–30 min easy bike",
            "Light football ball control"
          ]
        },
        sun: { type: "Rest", focus: "Recovery" }
      }
    },
    {
      id: 3,
      name: "Football Conditioning",
      duration: "Weeks 9–12",
      goal: "High-intensity intervals, agility, explosiveness",
      weeks: [9, 10, 11, 12],
      schedule: {
        mon: {
          type: "Strength",
          focus: "Power + Control",
          exercises: [
            { name: "Barbell Squat or Leg Press", sets: "3×6", weight: "-" },
            { name: "Barbell RDL", sets: "3×8", weight: "-" },
            { name: "Lat Pulldown or Cable Row", sets: "3×10", weight: "-" },
            { name: "Multi-Press Bench Press", sets: "3×8", weight: "-" },
            { name: "Leg Ext Superset w/ Leg Curl", sets: "2×12 each", weight: "-" },
            { name: "Cable Core Circuit", sets: "2–3 rounds", weight: "-", note: "Plank (30–45s) → Cable Rotations ×10/side → Cable Crunch ×12" }
          ]
        },
        tue: {
          type: "Cardio",
          focus: "Treadmill HIIT",
          description: "Warm-up: 5 min. Cool down: 5 min.",
          exercises: [
            { name: "Intervals", sets: "8–10 rounds", note: "30 sec fast run / 90 sec walk" }
          ]
        },
        wed: { type: "Rest", focus: "Recovery" },
        thu: {
          type: "Strength",
          focus: "Power + Control",
          exercises: [
            { name: "Barbell Squat or Leg Press", sets: "3×6", weight: "-" },
            { name: "Barbell RDL", sets: "3×8", weight: "-" },
            { name: "Lat Pulldown or Cable Row", sets: "3×10", weight: "-" },
            { name: "Multi-Press Bench Press", sets: "3×8", weight: "-" },
            { name: "Leg Ext Superset w/ Leg Curl", sets: "2×12 each", weight: "-" },
            { name: "Cable Core Circuit", sets: "2–3 rounds", weight: "-", note: "Plank (30–45s) → Cable Rotations ×10/side → Cable Crunch ×12" }
          ]
        },
        fri: {
          type: "Cardio",
          focus: "Football Conditioning Machines",
          options: [
            "Rowing: 250m moderate → 250m easy × 6 rounds",
            "Bike: 20 sec fast / 70 sec easy × 12"
          ]
        },
        sat: {
          type: "Drills",
          focus: "Football Drills",
          options: [
            "10m shuttle runs, Side shuffles, Cone zig-zag, Ball control (20–30 min)",
            "Treadmill incline sprints (10–12% incline, 15–20 sec bursts)"
          ]
        },
        sun: { type: "Rest", focus: "Recovery" }
      }
    }
  ]
};
