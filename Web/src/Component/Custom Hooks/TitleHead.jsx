import { useEffect } from 'react';
import { useTitle } from '../Context/TitleContext';

const TitleHead = (title) => {
  const { setPageTitle } = useTitle();
  
  useEffect(() => {
    document.title = `${title} | NuSmilePH`;
    setPageTitle(title);
  }, [title, setPageTitle]);
};

export default TitleHead;