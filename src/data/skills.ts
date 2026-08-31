export interface SkillGroup {
  category: string;
  items: string[];
}

const skills: SkillGroup[] = [
  {
    category: "Technologies I'm using",
    items: ["C", "Python", "Bash", "OpenSSL", "ICU (Unicode)", "Arweave"],
  },
  {
    category: "Technical concepts I'm deploying",
    items: [
      "Cryptography",
      "Steganography",
      "Perfect Forward Secrecy",
      "Threshold Cryptography",
      "Decentralised Infrastructure",
      "Cryptocurrency",
    ],
  },
  {
    category: "Things I'm currently learning",
    items: [
      "Cryptographic Systems Architecture",
      "System Administration",
      "Machine Learning",
      "Theoretical Computer Security",
      "Deployment of AI in Cybersecurity",
    ],
  },
];

export default skills;
