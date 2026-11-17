// -----------------------------------------------------------------------------
// App.tsx — the top-level "shell" component.
// Author: Bill Chen
//
// This is the single React component that main.tsx renders. It defines the
// layout that surrounds every page (Navbar on top, Footer on the bottom) and
// tells react-router which page component to show for each URL path.
// -----------------------------------------------------------------------------

// <Routes> is a container. <Route> maps a URL path to a component.
// Only the <Route> whose `path` matches the current URL is rendered.
// <Outlet> is the "slot" where a layout route renders its child routes.
import { Routes, Route, Outlet } from 'react-router-dom';

// Component imports use relative paths. The `./components/` prefix means
// "look in the components folder next to this file." Extensions are omitted;
// TypeScript resolves `.tsx` automatically.
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RequireAuth from './components/RequireAuth';

// Each "page" is just a plain React component — nothing special makes it a
// page except that we mount it inside a <Route>.
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Education from './pages/Education';
import Services from './pages/Services';
import Skills from './pages/Skills';
import Contact from './pages/Contact';
import Architecture from './pages/Architecture';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Messages from './pages/Messages';

// A React "function component" is any function whose name starts with a
// capital letter and returns JSX. `export default` makes it the primary
// export so other files can do `import App from './App'`.
//
// Layout is expressed inline as Tailwind utility classes. `min-h-full
// flex flex-col` on the shell + `flex-1` on <main> gives us a footer
// that sticks to the bottom when the page is short.
export default function App() {
  return (
    // JSX must return a single parent element. We use a <div> here, but
    // <> </> (a "fragment") also works when you don't want an extra wrapper.
    <div className="min-h-full flex flex-col">
      {/* The Navbar renders nothing while signed out (see Navbar.tsx). */}
      <Navbar />

      {/* <main> is the semantic HTML tag for the page's primary content.
          Screen readers use it to skip past the nav straight to the content.
          `max-w-content` reads from --container-content in the @theme block
          (1120px) — that's how the token-per-utility mapping works. */}
      <main className="flex-1 w-full max-w-content mx-auto px-5 pt-10 pb-16">
        <Routes>
          {/* PUBLIC routes: the only pages a signed-out visitor can open. */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* PRIVATE routes. This <Route> has no `path`: it is a "layout
              route" whose element wraps every child route below it.
              RequireAuth redirects signed-out visitors to /signin (and
              remembers the page they wanted); otherwise <Outlet /> renders
              the matching child page. The API enforces the same rules on the
              server — this guard only controls what the browser shows. */}
          <Route
            element={
              <RequireAuth>
                <Outlet />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/education" element={<Education />} />
            <Route path="/services" element={<Services />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Route>

          {/* The wildcard is the catch-all for unknown URLs. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}