import Dashboard from "@/components/Dashboard";
import AboutUs from "@/components/AboutUs"; 

// This is the setup for the "about us" page.
export default function ReuseUdesc() {
    const ReuseUdescription = {
        abtUsTitle: "About Us:",
        description: "ReuseU is a sustainability project for college students, by college students. On move-out day, do you find that you have a bunch of stuff you don't need anymore? Or, during the school year, you need a new coffee maker, but the ones at the store are too expensive? Worry no longer! We as a team set out to create a way for students to buy and exchange their goods throughout the year. The average college student creates 640 pounds of trash annually, and our hope is that ReuseU will become a place for students to help reduce and reuse items that students accumulate throughout the year. We as a team came together through the trenches of our Grinnell College Software Development class, CSC-324, and this is the project that resulted from that.",
        ourTeam: "Our team:",
    }
    return (
        <div>
            <Dashboard />
            <AboutUs
                abtUsTitle={ReuseUdescription.abtUsTitle}
                description={ReuseUdescription.description}
                ourTeam={ReuseUdescription.ourTeam}
            />
        </div>
    )
}