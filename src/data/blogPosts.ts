export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "binary-search-explained",
    title: "What is Binary Search? A Simple Explanation",
    excerpt: "Binary search is one of the most efficient algorithms for finding elements in a sorted array. Let me break it down step by step.",
    content: `Binary search is a fundamental algorithm that every programmer should understand. Instead of checking every single element (like linear search), binary search cuts the search space in half with each step.

## How It Works

1. Start with a sorted array
2. Find the middle element
3. If the middle element is your target — done!
4. If your target is smaller, search the left half
5. If your target is larger, search the right half
6. Repeat until found or the search space is empty

## Code Example

\`\`\`cpp
int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
\`\`\`

## Time Complexity

Binary search runs in **O(log n)** time, which is dramatically faster than linear search's O(n). For an array of 1 million elements, binary search needs at most ~20 comparisons. Linear search could need up to 1 million.

## When to Use It

- The data must be **sorted**
- You need fast lookups in large datasets
- Great for problems like "find the first/last occurrence"

Binary search is a building block for many advanced algorithms. Master it early — it will come up in interviews and real-world code alike.`,
    date: "2026-03-15",
    category: "Programming",
    readTime: "4 min",
  },
  {
    id: "how-i-built-my-first-website",
    title: "How I Built My First Website",
    excerpt: "From zero to deployed — my journey building a website with HTML, CSS, and JavaScript as a complete beginner.",
    content: `Every developer remembers their first website. Mine was messy, beautiful (to me), and taught me more than any textbook could.

## The Spark

I was scrolling through YouTube when I saw a tutorial on building a simple portfolio page. Something clicked. I downloaded VS Code, opened a blank file, and typed my first \`<html>\` tag.

## What I Built

A simple portfolio page with:
- A header with my name
- An about section
- A contact form (that didn't actually work)

## Lessons Learned

**1. Start ugly, then refine.** My first version had no CSS. Just raw HTML. And that was fine — I could see the structure before worrying about style.

**2. CSS is harder than it looks.** Centering a div took me an embarrassingly long time. Flexbox eventually saved my life.

**3. JavaScript adds magic.** A simple dark mode toggle made me feel like a real developer.

\`\`\`javascript
const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
\`\`\`

## The Deploy

I used GitHub Pages to put it online. Sharing that link with friends was one of the proudest moments of my coding journey so far.

## Advice for Beginners

Don't wait until you "know enough." Build something today. It will be imperfect, and that's the point.`,
    date: "2026-03-08",
    category: "Web Dev",
    readTime: "5 min",
  },
  {
    id: "beginner-guide-to-cybersecurity",
    title: "Beginner Guide to Cybersecurity",
    excerpt: "Cybersecurity can feel overwhelming. Here's a grounded introduction to what it is, why it matters, and how to start learning.",
    content: `Cybersecurity isn't just about hacking — it's about protecting systems, data, and people. Here's what I've learned as a CS student diving into this field.

## What Is Cybersecurity?

At its core, cybersecurity is the practice of defending computers, servers, networks, and data from malicious attacks. It covers everything from password hygiene to national defense systems.

## Key Areas

- **Network Security** — protecting data in transit
- **Application Security** — writing secure code
- **Information Security** — protecting data at rest
- **Incident Response** — handling breaches when they happen

## Getting Started

**1. Learn the fundamentals of networking.** Understand TCP/IP, DNS, HTTP, and how data moves across the internet.

**2. Practice on safe platforms.** Sites like TryHackMe and HackTheBox offer beginner-friendly labs.

**3. Learn Linux.** Most security tools run on Linux. Get comfortable with the terminal.

\`\`\`bash
# Basic network scan with nmap
nmap -sV -sC target_ip

# Check open ports
netstat -tuln
\`\`\`

**4. Understand common vulnerabilities.** Start with the OWASP Top 10 — it's the industry standard list of web application security risks.

## Why It Matters

Every organization, from startups to governments, needs people who understand security. The demand is massive and growing. If you're curious and methodical, this field might be for you.

## Resources

- TryHackMe (tryhackme.com)
- HackTheBox (hackthebox.com)
- OverTheWire wargames
- Professor Messer's Security+ videos`,
    date: "2026-02-28",
    category: "Cybersecurity",
    readTime: "6 min",
  },
  {
    id: "understanding-big-o-notation",
    title: "Understanding Big O Notation",
    excerpt: "Big O notation describes how your algorithm scales. Here's an intuitive guide to understanding it without the math anxiety.",
    content: `Big O notation is how we talk about the efficiency of algorithms. It answers the question: "As my input grows, how much slower does my code get?"

## The Common Complexities

- **O(1)** — Constant. Accessing an array element by index.
- **O(log n)** — Logarithmic. Binary search.
- **O(n)** — Linear. Looping through an array once.
- **O(n log n)** — Merge sort, quicksort (average).
- **O(n²)** — Quadratic. Nested loops (bubble sort).
- **O(2ⁿ)** — Exponential. Recursive Fibonacci without memoization.

## A Practical Example

\`\`\`javascript
// O(n) — linear
function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

// O(n²) — quadratic
function hasDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}
\`\`\`

## Why It Matters

When your dataset is small, everything is fast. But when you're processing thousands or millions of records, the difference between O(n) and O(n²) is the difference between milliseconds and minutes.

Understanding Big O helps you write code that scales — and it's a staple of technical interviews.`,
    date: "2026-02-18",
    category: "Programming",
    readTime: "5 min",
  },
  {
    id: "linux-terminal-essentials",
    title: "Linux Terminal Commands Every Developer Needs",
    excerpt: "The terminal might look intimidating, but mastering a few key commands will make you dramatically more productive.",
    content: `The command line is where real productivity lives. Here are the commands I use daily as a CS student.

## File Navigation

\`\`\`bash
pwd          # Print working directory
ls -la       # List all files with details
cd ~/projects # Change directory
mkdir new-project # Create directory
\`\`\`

## File Operations

\`\`\`bash
cp file.txt backup.txt     # Copy
mv old.txt new.txt         # Rename/move
rm -rf unwanted-folder     # Delete (careful!)
cat config.txt             # View file contents
nano script.sh             # Edit in terminal
\`\`\`

## Process Management

\`\`\`bash
ps aux        # List all processes
kill -9 PID   # Force kill a process
top           # Real-time process monitor
\`\`\`

## Networking

\`\`\`bash
ping google.com        # Test connectivity
curl -I example.com    # HTTP headers
ifconfig               # Network interfaces
\`\`\`

## Pro Tips

- Use **Tab** for auto-completion
- **Ctrl+R** to search command history
- Chain commands with \`&&\`
- Redirect output with \`>\` and \`>>\`

The terminal is your friend. The more you use it, the more natural it becomes. Start by doing one task per day in the terminal instead of a GUI — you'll be surprised how quickly it clicks.`,
    date: "2026-02-10",
    category: "Programming",
    readTime: "4 min",
  },
];

export const categories = ["All", "Programming", "Web Dev", "Cybersecurity"];
