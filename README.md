# The Universal Feeling of Being Watched: A Reflection of Our Existence

In a world where we're constantly being observed, judged, and influenced, the feeling of being watched is a universal phenomenon that transcends cultures and boundaries. It's a sensation that can evoke feelings of comfort, anxiety, or even paranoia. This project is an exploration of that feeling, a reflection of our existence in a world where we're always being seen.

The eye-tracking effect works like a simplified version of real eye movement. Here's how:

### 1. Finding the Center Point
- Each eye has a center point (like the pivot of a real eye)
- We calculate this by finding the middle of each eye element

### 2. Mouse Position
- We track where your mouse cursor is on the screen
- We measure how far your mouse is from each eye's center (both horizontally and vertically)

### 3. Movement Calculation (in simple terms)
Imagine each eye's pupil is attached to the center with a rubber band:
1. The pupil wants to look at your mouse cursor
2. The rubber band limits how far it can stretch (this is our `radius` limit)
3. The closer your mouse is to an eye, the less the pupil moves
4. The further your mouse is, the more the pupil stretches (up to its limit)

### 4. Technical:
We use:
- `dx` and `dy`: How far the mouse is from the eye (like "2 inches right, 3 inches up")
- `angle`: The direction to look (calculated using `Math.atan2`)
- `distance`: How far to move (using `Math.hypot` for distance calculation)
- Convert back to x,y coordinates using `Math.cos` and `Math.sin`

devnotes:

this thing needs to be responsive

domain: eyesonyou.me


don't forget to update the favicon icon


ideas:

- one different color eye when clicked on that it will open the modal explaining what is this, and why is this created(main philosophy)
- when moving in the phone, and moving the gyro, it will also move the pupil with the phone movement, in the desktop it's going to be mouse movement
- accidentally clicking on any eyes, will make he chaos, closing and opening the eye, like the real one, and moving the pupil of the eyes in random order
- there should be a dance mode, where music plays in the background and eyes dance with the great rhythm and sequence
- camera tracking also(this would be really dope)

this thing needs to be responsive

domain: eyesonyou.me


don't forget to update the favicon icon