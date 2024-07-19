'use client';
import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

type PaginationProps = {
    page: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (newPage: number) => void;
};

const CustomPagination = ({ page, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="flex justify-center mt-4">
            <Pagination>
                <PaginationContent>
                    {page > 1 && (
                        <PaginationItem>
                            <PaginationPrevious href="#" onClick={() => onPageChange(page - 1)} />
                        </PaginationItem>
                    )}
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <PaginationItem key={i}>
                            <PaginationLink
                                href="#"
                                onClick={() => onPageChange(i + 1)}
                                isActive={page === i + 1}
                            >
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    {totalPages > 1 && page < totalPages && (
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                    )}
                    {page < totalPages && (
                        <PaginationItem>
                            <PaginationNext href="#" onClick={() => onPageChange(page + 1)} />
                        </PaginationItem>
                    )}
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default CustomPagination;
