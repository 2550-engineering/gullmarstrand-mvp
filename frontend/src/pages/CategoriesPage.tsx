import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Breadcrumbs,
  Link,
  CircularProgress,
  Box
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Category, getCategories } from '../api/categories';

const getCategoryPath = (categories: Category[], targetCategory: Category): Category[] => {
  const findPath = (cats: Category[], target: Category, path: Category[]): Category[] | null => {
    for (const cat of cats) {
      if (cat.id === target.id) {
        return [...path, cat];
      }
      if (cat.children && cat.children.length > 0) {
        const found = findPath(cat.children, target, [...path, cat]);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };
  
  return findPath(categories, targetCategory, []) || [targetCategory];
};

const findCategoryByPath = (categories: Category[], path: string[]): Category | undefined => {
  if (path.length === 0) return undefined;
  
  let current: Category | undefined;
  let currentCategories = categories;
  
  for (const slug of path) {
    current = currentCategories.find(c => c.slug === slug);
    if (!current) return undefined;
    currentCategories = current.children || [];
  }
  
  return current;
};

const findCategoryBySlug = (categories: Category[], targetSlug: string): Category | undefined => {
  for (const category of categories) {
    if (category.slug === targetSlug) {
      return category;
    }
    if (category.children && category.children.length > 0) {
      const found = findCategoryBySlug(category.children, targetSlug);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { "*": categoryPath } = useParams();
  const pathSlugs = categoryPath ? categoryPath.split('/') : [];

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        if (isMounted) {
          setCategories(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [categoryPath]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const currentCategory = pathSlugs.length > 0 ? findCategoryByPath(categories, pathSlugs) : undefined;
  const categoryPathItems = currentCategory ? getCategoryPath(categories, currentCategory) : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/categories" color="inherit">
          Categories
        </Link>
        {categoryPathItems.map((category, index) => {
          const pathToHere = categoryPathItems
            .slice(0, index + 1)
            .map(c => c.slug)
            .join('/');
          return index === categoryPathItems.length - 1 ? (
            <Typography key={category.id} color="text.primary">
              {category.name}
            </Typography>
          ) : (
            <Link
              key={category.id}
              component={RouterLink}
              to={`/categories/${pathToHere}`}
              color="inherit"
            >
              {category.name}
            </Link>
          );
        })}
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        {currentCategory ? currentCategory.name : 'Browse Categories'}
      </Typography>

      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
        {(currentCategory
          ? (() => {
              const current = currentCategory;
              if (!current) return [];
              if (current.children && current.children.length > 0) {
                return current.children;
              } else {
                return [{ id: 'no-children', name: 'No further subcategories', slug: '', sort_order: 0, children: [] }];
              }
            })()
          : categories
        ).map((category) => (
          category.id === 'no-children' ? (
            <Box component="div" sx={{ width: '100%', my: 2 }} key="no-children">
              <Typography variant="body1" color="text.secondary" align="center">
                No further subcategories
              </Typography>
            </Box>
          ) : (
            <Box component="div" sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, p: 1 }} key={category.id}>
              <Card>
                <CardActionArea 
          component={RouterLink} 
          to={`/categories/${[...pathSlugs, category.slug].filter(Boolean).join('/')}`}>
                  <CardContent>
                    {category.icon && (
                      <Box sx={{ mb: 2, fontSize: '2rem' }}>
                        {category.icon}
                      </Box>
                    )}
                    <Typography variant="h6" component="div">
                      {category.name || 'Unnamed Category'}
                    </Typography>
                    {category.children && category.children.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {category.children.length} subcategorie{category.children.length === 1 ? '' : 's'}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          )
        ))}
        {categories.length === 0 && (
          <Box sx={{ width: '100%', p: 2 }}>
            <Typography variant="body1" color="text.secondary" align="center">
              No categories found
            </Typography>
          </Box>
        )}
        </Grid>
      </Box>
    </Container>
  );
};

export default CategoriesPage;